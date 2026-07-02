"""Shared pipeline for the Instagram semantic image search demo.

Same building blocks as the notebook (SerpApi fetch → Jina v5 Omni embed → Elasticsearch
dense_vector + kNN), packaged so the Streamlit app (app.py) can reuse them. Client-side
embedding only (the durable, Basic-license-safe default).
"""
import os
import time
import base64
from io import BytesIO
from datetime import datetime, timezone
from concurrent.futures import ThreadPoolExecutor

import requests
import serpapi
from PIL import Image
from dotenv import load_dotenv
from elasticsearch import Elasticsearch, helpers

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(BASE_DIR, ".env"))

# ── Config (matches the notebook) ────────────────────────────────────
JINA_MODEL  = "jina-embeddings-v5-omni-small"
EMBED_DIM   = 1024
EMBED_BATCH = 8
DOWNLOAD_WORKERS = 12
MAX_ITEMS   = 1500
MAX_PAGES   = 100
ES_INDEX    = "instagram_photos"
IMAGES_DIR  = os.path.join(BASE_DIR, "images")

JINA_URL = "https://api.jina.ai/v1/embeddings"

# ── Clients ──────────────────────────────────────────────────────────
serp_client  = serpapi.Client(api_key=os.getenv("SERPAPI_API_KEY"), timeout=30)
jina_headers = {"Authorization": f"Bearer {os.getenv('JINA_API_KEY')}", "Content-Type": "application/json"}
es = Elasticsearch(os.getenv("ES_URL", "http://localhost:9200"), api_key=os.getenv("ES_API_KEY"),
                   request_timeout=60, max_retries=3, retry_on_timeout=True)

os.makedirs(IMAGES_DIR, exist_ok=True)


# ── Embedding (client-side Jina, shared text↔image space) ────────────
def _jina_embed(images_b64=None, texts=None, task="retrieval.passage", max_retries=4):
    # Jina v5 omni: a single `input` list mixing item types: text {"text": ...} and image {"image": ...}.
    # (Verified against the live api.jina.ai/v1/embeddings endpoint: a top-level `images` field is
    # rejected with 422.) task=retrieval.passage for documents/images, retrieval.query for searches.
    if images_b64:
        inputs = [{"image": f"data:image/jpeg;base64,{b}"} for b in images_b64]
    else:
        inputs = [{"text": t} for t in texts]
    payload = {"model": JINA_MODEL, "task": task, "dimensions": EMBED_DIM, "input": inputs}
    for attempt in range(1, max_retries + 1):
        r = requests.post(JINA_URL, headers=jina_headers, json=payload, timeout=120)
        if r.status_code == 429 and attempt < max_retries:
            time.sleep(int(r.headers.get("Retry-After", 5 * attempt)))  # honor free-tier rate limit
            continue
        r.raise_for_status()
        data = sorted(r.json()["data"], key=lambda d: d["index"])
        return [d["embedding"] for d in data]


def embed_query(text):
    return _jina_embed(texts=[text], task="retrieval.query")[0]


def embed_images(images_b64):
    return _jina_embed(images_b64=images_b64, task="retrieval.passage")


# ── Fetch (SerpApi, incremental + deduped) ───────────────────────────
def get_caption(post):
    caps = post.get("media_captions") or []
    return caps[0] if caps else ""


def existing_shortcodes(username):
    if not es.indices.exists(index=ES_INDEX):
        return set()
    resp = es.search(index=ES_INDEX, size=10_000,
                     query={"term": {"username": username}},
                     source_includes=["shortcode"])
    return {h["_source"]["shortcode"] for h in resp["hits"]["hits"]}


def _serp_search(params, retries=3):
    """Call SerpApi, retrying with backoff on a transient failure. SerpApi signals failure two
    ways: an HTTP error (the SDK raises serpapi.HTTPError / serpapi.TimeoutError) or a normal 200
    body with an "error" key (e.g. a flaky scrape / no results). Both can be transient for the
    Instagram engine deep in a feed, so we retry a few times with a short backoff. Returns
    (results, None) on success or (None, reason) once it gives up."""
    reason = None
    for attempt in range(retries + 1):
        if attempt:
            time.sleep(2 * attempt)  # 2s, 4s, 6s, to let a flaky upstream scrape recover
        try:
            results = serp_client.search(params)
        except (serpapi.HTTPError, serpapi.TimeoutError) as e:
            reason = str(e)
            continue
        if results.get("error"):
            reason = results["error"]
            continue
        return results, None
    return None, reason


def fetch_profile_posts(username, max_items=MAX_ITEMS, max_pages=MAX_PAGES, known=None,
                        on_event=None, stop_when_caught_up=True):
    """Page newest-first, keeping only new + deduped posts. `on_event(dict)` reports progress
    (always from the calling thread, so it's safe to drive a Streamlit UI).

    stop_when_caught_up=True (default) stops at the first all-already-indexed page, a cheap
    incremental refresh of the latest posts. Set False to keep paging past known posts and
    backfill deeper history (skipping the ones already indexed)."""
    emit = on_event or (lambda e: None)
    known = set(known or ())
    base = {"engine": "instagram_profile", "profile_id": username}
    params = dict(base)
    profile, kept, seen = {}, [], set()
    for page in range(1, max_pages + 1):
        results, err = _serp_search(params)
        if results is None:
            emit({"phase": "note", "msg": f"Stopped at page {page}: {err}"})
            break
        profile = results.get("profile_results", {})
        if profile.get("is_private") or profile.get("is_embeds_disabled"):
            emit({"phase": "note", "msg": f"@{username} has no embeddable media, stopping."})
            break
        batch = profile.get("posts", [])
        new_vs_known = [p for p in batch if p.get("shortcode") not in known]
        fresh = [p for p in new_vs_known if p.get("shortcode") not in seen]
        seen.update(p["shortcode"] for p in fresh)
        kept.extend(fresh)
        emit({"phase": "fetch", "page": page, "posts": len(kept)})
        if stop_when_caught_up and batch and not new_vs_known:
            emit({"phase": "note", "msg": "Caught up to already-indexed posts."})
            break
        next_token = results.get("serpapi_pagination", {}).get("next_page_token")
        if not next_token or len(kept) >= max_items:
            break
        params = {**base, "next_page_token": next_token}
    return profile, kept[:max_items]


# ── Download + index ─────────────────────────────────────────────────
def download_image(post, timeout=30):
    path = os.path.join(IMAGES_DIR, f"{post['shortcode']}.jpg")
    if os.path.exists(path):
        return path
    url = post.get("serpapi_display_url") or post.get("display_url")
    resp = requests.get(url, timeout=timeout)
    resp.raise_for_status()
    Image.open(BytesIO(resp.content)).convert("RGB").save(path, "JPEG", quality=90)
    return path


def _image_to_b64(path):
    with open(path, "rb") as f:
        return base64.b64encode(f.read()).decode("ascii")


def ensure_index():
    if es.indices.exists(index=ES_INDEX):
        return
    es.indices.create(index=ES_INDEX, mappings={"properties": {
        "embedding": {"type": "dense_vector", "dims": EMBED_DIM, "similarity": "cosine",
                      "index": True, "index_options": {"type": "flat"}},
        "caption": {"type": "text", "fields": {"keyword": {"type": "keyword"}}},
        "shortcode": {"type": "keyword"}, "post_url": {"type": "keyword"},
        "image_url": {"type": "keyword"}, "thumbnail_url": {"type": "keyword"},
        "image_path": {"type": "keyword"}, "username": {"type": "keyword"},
        "is_video": {"type": "boolean"}, "liked_by_count": {"type": "long"},
        "comments_count": {"type": "long"},
    }})


def _download_safe(post):
    """Download in a worker thread; never touches the UI (so no cross-thread st calls)."""
    try:
        return post, download_image(post)
    except Exception:
        return post, None


def _record(post, username, vec):
    return {
        "shortcode": post["shortcode"],
        "post_url": f"https://www.instagram.com/p/{post['shortcode']}/",
        "image_url": post.get("serpapi_display_url") or post.get("display_url"),
        "thumbnail_url": post.get("serpapi_thumbnail_src"),
        "image_path": os.path.join("images", f"{post['shortcode']}.jpg"),
        "caption": get_caption(post), "username": username,
        "is_video": bool(post.get("is_video")),
        # SerpApi fills liked_by_count only for the newest ~page of posts, but
        # media_preview_likes_count is present on EVERY post (and identical when both exist),
        # so fall back to it for complete like coverage across the whole feed.
        "liked_by_count": post.get("liked_by_count") or post.get("media_preview_likes_count"),
        "comments_count": post.get("comments_count"),
        "embedding": vec,
    }


def index_profile(username, max_pages=MAX_PAGES, on_event=None, backfill=False):
    """Fetch new posts for a profile, embed cover images, and index them. Returns count added.

    backfill=False (default): incremental. Stops at the first already-indexed page (latest posts).
    backfill=True: keep paging to fill in deeper history (still skips posts already indexed).

    Embeds + indexes batch-by-batch, so a mid-run API hiccup keeps the batches already done.
    Progress is reported via on_event(dict), always called from the *calling* thread, so it's safe to
    drive a Streamlit progress bar. Phases:
      {"phase":"fetch",    "page":p, "posts":N}   # cumulative new posts found
      {"phase":"download", "done":i, "total":N}
      {"phase":"embed",    "done":i, "total":N}
      {"phase":"note",     "msg":...}             # e.g. caught-up / private / stopped / failures
      {"phase":"done",     "added":N}
    """
    emit = on_event or (lambda e: None)
    ensure_index()
    profile, posts = fetch_profile_posts(
        username, max_pages=max_pages, known=existing_shortcodes(username),
        on_event=emit, stop_when_caught_up=not backfill,
    )
    if not posts:
        emit({"phase": "done", "added": 0})
        return 0

    total = len(posts)
    # Download concurrently; emit progress from this thread as ordered results arrive.
    downloaded = []
    with ThreadPoolExecutor(max_workers=DOWNLOAD_WORKERS) as pool:
        for i, (post, path) in enumerate(pool.map(_download_safe, posts), 1):
            if path:
                downloaded.append((post, path))
            emit({"phase": "download", "done": i, "total": total})

    # Embed AND index batch-by-batch so partial progress survives a mid-run failure.
    added, failed = 0, 0
    for start in range(0, len(downloaded), EMBED_BATCH):
        chunk = downloaded[start:start + EMBED_BATCH]
        vectors = embed_images([_image_to_b64(path) for _, path in chunk])
        recs = [_record(post, username, vec) for (post, _), vec in zip(chunk, vectors)]
        ok, errors = helpers.bulk(
            es, [{"_index": ES_INDEX, "_id": r["shortcode"], **r} for r in recs],
            stats_only=False, raise_on_error=False,
        )
        added += ok
        failed += len(errors)
        emit({"phase": "embed", "done": min(start + EMBED_BATCH, len(downloaded)), "total": len(downloaded)})

    es.indices.refresh(index=ES_INDEX)
    if failed:
        emit({"phase": "note", "msg": f"{failed} docs failed to index"})
    emit({"phase": "done", "added": added})
    return added


# ── Search ───────────────────────────────────────────────────────────
def indexed_usernames():
    if not es.indices.exists(index=ES_INDEX):
        return []
    resp = es.search(index=ES_INDEX, size=0,
                     aggs={"u": {"terms": {"field": "username", "size": 100}}})
    return [b["key"] for b in resp["aggregations"]["u"]["buckets"]]


def image_abspath(stored_path):
    """Resolve a stored image_path (relative 'images/x.jpg') to an absolute path."""
    return stored_path if os.path.isabs(stored_path) else os.path.join(BASE_DIR, stored_path)


# Instagram shortcodes encode the post's creation time (the media id is Snowflake-like), so we
# can derive the real post date without storing a timestamp (the API doesn't return one).
_SC_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"


def _shortcode_ts_ms(shortcode):
    """Decode shortcode -> media id -> milliseconds since Instagram's epoch (2011-08-24)."""
    mid = 0
    for ch in shortcode:
        mid = mid * 64 + _SC_ALPHABET.index(ch)
    return (mid >> 23) + 1314220021721


def post_date(shortcode, fmt="%b %d, %Y"):
    """Human-readable post date (UTC) derived from the shortcode."""
    return datetime.fromtimestamp(_shortcode_ts_ms(shortcode) / 1000, tz=timezone.utc).strftime(fmt)


def recent(username, k=24):
    """The profile's images, newest first. Date comes from the shortcode (no stored timestamp),
    so we pull the profile's docs and sort by decoded time in Python. Returns hit dicts."""
    resp = es.search(
        index=ES_INDEX, size=10_000,
        query={"term": {"username": username}},
        source_excludes=["embedding"],
    )
    hits = resp["hits"]["hits"]
    hits.sort(key=lambda h: _shortcode_ts_ms(h["_source"]["shortcode"]), reverse=True)
    return hits[:k]


def search(query, username, k=6):
    """Text→image kNN, scoped to one profile. Returns the raw hit dicts (with _source)."""
    qv = embed_query(query)
    resp = es.search(
        index=ES_INDEX,
        retriever={"knn": {"field": "embedding", "query_vector": qv, "k": k,
                           "num_candidates": 100, "filter": {"term": {"username": username}}}},
        size=k, source_excludes=["embedding"],
    )
    return resp["hits"]["hits"]
