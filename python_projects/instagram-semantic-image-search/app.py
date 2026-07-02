"""Streamlit UI for semantic image search over Instagram profiles.

Run from the project root:   streamlit run app.py
Searches the Elasticsearch index built by the notebook / pipeline.py. Results are ranked by
the *image* (Jina v5 Omni shared text↔image space), so a text query finds matching pictures.
"""
import streamlit as st

import pipeline as pl

st.set_page_config(page_title="Instagram Semantic Image Search", page_icon="🔎", layout="wide")

st.title("Semantic image search over Instagram")
st.caption(
    "Type what you want to see. Results are ranked by the image itself, "
    "not the caption. Powered by SerpApi · Jina v5 Omni · Elasticsearch."
)

# ── Sidebar: profile + settings + (optional) indexing ────────────────
with st.sidebar:
    st.header("Settings")
    profiles = pl.indexed_usernames()

    # Result of the previous indexing run (survives the rerun that refreshes the dropdown).
    done = st.session_state.pop("indexed_result", None)
    if done:
        user, added, note = done
        if added:
            st.success(f"✅ @{user}: {added} new images indexed")
        else:
            st.warning(f"@{user}: nothing new indexed" + (f" ({note})" if note else ""))

    if profiles:
        default_idx = profiles.index(done[0]) if (done and done[0] in profiles) else 0
        profile = st.selectbox("Profile", profiles, index=default_idx)
    else:
        profile = None
        st.info("No profiles indexed yet. Add one below.")

    top_k = st.slider("Results to show", 3, 12, 6)
    show_caption = st.checkbox(
        "Show captions", value=False,
        help="Off by default so it's clear the ranking comes from the image, not the text.",
    )

    st.divider()
    with st.expander("➕ Index a new profile"):
        st.write("Fetch a public profile's posts and add them to the index.")
        new_user = st.text_input("Public IG username", placeholder="nasa")
        pages = st.slider("Pages (~1 SerpApi credit each)", 3, 100, 10)
        if st.button("Fetch + index", disabled=not new_user, use_container_width=True):
            user = new_user.strip().lstrip("@")
            note = {"msg": ""}
            bar = st.progress(0.0, text="Starting…")

            def on_event(e):
                phase = e["phase"]
                if phase == "fetch":
                    bar.progress(0.05, text=f"Fetching posts… {e['posts']} found")
                elif phase == "download":
                    bar.progress(0.05 + 0.45 * e["done"] / e["total"],
                                 text=f"Downloading images… {e['done']}/{e['total']}")
                elif phase == "embed":
                    bar.progress(0.50 + 0.50 * e["done"] / e["total"],
                                 text=f"Embedding… {e['done']}/{e['total']}")
                elif phase == "note":
                    note["msg"] = e["msg"]
                elif phase == "done":
                    bar.progress(1.0, text="Done")

            added = pl.index_profile(user, max_pages=pages, on_event=on_event)
            st.session_state["indexed_result"] = (user, added, note["msg"])
            st.rerun()

# ── Main: query + results ────────────────────────────────────────────
# Empty box → browse the profile's most recent images. Type a query → semantic image search.
st.session_state.setdefault("query", "")

# Clickable starting points. One click runs the search (and fills the box to match).
EXAMPLE_QUERIES = [
    "a dog wearing sunglasses", "snow-capped mountains", "horseback riding",
    "a close-up portrait", "a cat", "a person at sunset",
    "someone holding a phone",
]


def _use_example(q):
    # Runs as a button callback (before widgets re-instantiate), so it can set the input's
    # keyed state and the active query together.
    st.session_state["search_box"] = q
    st.session_state["query"] = q


# A form so pressing Enter in the box submits the search (same as clicking the button).
# The input owns its state via a stable `key`. Do NOT pass a changing `value=`, or Streamlit
# treats it as a new widget each time the active query changes and discards the freshly typed
# text, searching the *previous* keyword instead.
with st.form("search_form"):
    st.text_input("Search", key="search_box",
                  placeholder="e.g. a dog wearing sunglasses")
    submitted = st.form_submit_button("Search", type="primary")
if submitted:
    st.session_state["query"] = st.session_state["search_box"].strip()

st.caption("Try an example:")
for col, ex in zip(st.columns(len(EXAMPLE_QUERIES)), EXAMPLE_QUERIES):
    col.button(ex, on_click=_use_example, args=(ex,), use_container_width=True)

query = st.session_state["query"].strip()


def show_grid(hits, label):
    """Render hits in a 3-column image grid; `label(i, hit)` returns the markdown caption."""
    cols = st.columns(3)
    for i, h in enumerate(hits):
        src = h["_source"]
        with cols[i % 3]:
            st.image(pl.image_abspath(src["image_path"]), use_container_width=True)
            st.markdown(label(i, h))
            if show_caption and src.get("caption"):
                st.caption(src["caption"][:160])
            st.markdown(f"[View post]({src['post_url']})")


if not profile:
    st.info("To get started, index a profile with **➕ Index a new profile** in the sidebar.")
elif query:
    with st.spinner("Embedding query and searching…"):
        hits = pl.search(query, username=profile, k=top_k)
    st.subheader(f"Top {len(hits)} image matches for “{query}” in @{profile}")
    show_grid(hits, lambda i, h: f"**#{i + 1} · score {h['_score']:.3f}**"
                                 + (" · 🎬 video" if h["_source"].get("is_video") else ""))
else:
    hits = pl.recent(profile, k=24)
    st.subheader(f"📅 Most recent in @{profile}")
    st.caption("Sorted newest first, with dates decoded from each post's shortcode. Type a query above to rank by image instead.")
    show_grid(hits, lambda i, h: f"**{pl.post_date(h['_source']['shortcode'])}**"
                                 + (" · 🎬 video" if h["_source"].get("is_video") else ""))
