import os
import re
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta, timezone

import altair as alt
import pandas as pd
import serpapi
import streamlit as st

# Constants

SERPAPI_KEY = os.environ.get("SERPAPI_KEY", "")
DEFAULT_BRAND = "serpapi"
CHART_COLOR = "#4A90D9"
CHART_HEIGHT = 350
YT_FILTER_WEEK = "EgIIAw%3D%3D"
YT_FILTER_MONTH = "EgIIBA%3D%3D"

RELATIVE_DATE_RE = re.compile(
    r"(\d+)\s+(second|minute|hour|day|week|month|year)s?\s+ago", re.IGNORECASE
)

UNIT_TO_TIMEDELTA = {
    "second": lambda n: timedelta(seconds=n),
    "minute": lambda n: timedelta(minutes=n),
    "hour": lambda n: timedelta(hours=n),
    "day": lambda n: timedelta(days=n),
    "week": lambda n: timedelta(weeks=n),
    "month": lambda n: timedelta(days=n * 30),
    "year": lambda n: timedelta(days=n * 365),
}


# Fetch

def fetch_news(client, brand):
    """Fetch news articles mentioning the brand via Google News."""
    results = client.search({
        "engine": "google_news",
        "q": brand,
        "gl": "us",
        "hl": "en",
    })
    return results.get("news_results", [])


def fetch_youtube(client, brand):
    """Fetch YouTube videos mentioning the brand, combining week and month filters."""
    seen = set()
    videos = []

    for sp_filter in (YT_FILTER_WEEK, YT_FILTER_MONTH):
        results = client.search({
            "engine": "youtube",
            "search_query": brand,
            "sp": sp_filter,
        })
        for video in results.get("video_results", []):
            link = video.get("link", "")
            if link and link not in seen:
                seen.add(link)
                videos.append(video)

    return videos


def fetch_perspectives(client, brand):
    """Fetch user-generated content (Reddit, LinkedIn, Quora) via Google Perspectives."""
    results = client.search({
        "engine": "google",
        "q": brand,
        "google_domain": "google.com",
    })
    return results.get("perspectives", [])


@st.cache_data(ttl=300)
def fetch_all_mentions(brand):
    """Fetch all brand mentions from News, YouTube, and Perspectives in parallel."""
    if not SERPAPI_KEY:
        raise Exception(
            "SERPAPI_KEY environment variable not set. "
            "Get your API key at https://serpapi.com/manage-api-key"
        )

    client = serpapi.Client(api_key=SERPAPI_KEY)

    with ThreadPoolExecutor(max_workers=3) as pool:
        news_future = pool.submit(fetch_news, client, brand)
        yt_future = pool.submit(fetch_youtube, client, brand)
        persp_future = pool.submit(fetch_perspectives, client, brand)
        return news_future.result(), yt_future.result(), persp_future.result()


# Transform

def parse_relative_date(text):
    """Convert relative date strings like '2 hours ago' into datetime objects."""
    if not text:
        return datetime.now(timezone.utc)

    match = RELATIVE_DATE_RE.search(str(text))
    if not match:
        return datetime.now(timezone.utc)

    amount = int(match.group(1))
    unit = match.group(2).lower()
    delta = UNIT_TO_TIMEDELTA.get(unit, lambda n: timedelta())(amount)

    return datetime.now(timezone.utc) - delta


def transform_news(results):
    """Convert raw Google News results into structured records."""
    records = []
    for item in results:
        source = item.get("source") or {}
        source_name = source.get("name", "Unknown") if isinstance(source, dict) else str(source)

        records.append({
            "title": item.get("title", ""),
            "link": item.get("link", ""),
            "source": source_name,
            "date": parse_relative_date(item.get("date", "")),
            "snippet": item.get("snippet", ""),
        })
    return records


def transform_youtube(results):
    """Convert raw YouTube results into structured records."""
    records = []
    for item in results:
        channel = item.get("channel") or {}
        channel_name = channel.get("name", "Unknown") if isinstance(channel, dict) else str(channel)

        views = item.get("views") or 0
        if isinstance(views, str):
            views = int(re.sub(r"[^\d]", "", views) or 0)
        views = int(views)

        records.append({
            "title": item.get("title", ""),
            "link": item.get("link", ""),
            "channel": channel_name,
            "views": views,
            "date": parse_relative_date(item.get("published_date", "")),
            "length": item.get("length", ""),
        })
    return records


def transform_perspectives(results):
    """Convert raw Google Perspectives results into structured records."""
    records = []
    for item in results:
        records.append({
            "title": item.get("title", ""),
            "link": item.get("link", ""),
            "source": item.get("source") or "Unknown",
            "author": item.get("author") or "",
            "date": parse_relative_date(item.get("date", "")),
            "snippet": item.get("snippet", ""),
        })
    return records


# Streamlit Dashboard

st.set_page_config(page_title="Brand Monitoring Dashboard", layout="wide")
st.title("Brand Monitoring Dashboard")

# Brand input
with st.form("brand_form"):
    col_brand, col_btn = st.columns([3, 1])
    with col_brand:
        brand = st.text_input("Brand or keyword to monitor", value=DEFAULT_BRAND)
    with col_btn:
        st.markdown("<br>", unsafe_allow_html=True)
        submitted = st.form_submit_button("Search")

# Fetch and transform
try:
    raw_news, raw_youtube, raw_perspectives = fetch_all_mentions(brand)
except Exception as e:
    st.error(str(e))
    st.stop()

news_records = transform_news(raw_news)
yt_records = transform_youtube(raw_youtube)
persp_records = transform_perspectives(raw_perspectives)

news_df = pd.DataFrame(news_records)
yt_df = pd.DataFrame(yt_records)
persp_df = pd.DataFrame(persp_records)

total_mentions = len(news_records) + len(yt_records) + len(persp_records)

if total_mentions == 0:
    st.warning(f"No mentions found for '{brand}'. Try a different keyword.")
    st.stop()

# Metrics row
col1, col2, col3, col4 = st.columns(4)
col1.metric("Total Mentions", total_mentions)
col2.metric("News Articles", len(news_records))
col3.metric("YouTube Videos", len(yt_records))
col4.metric("Perspectives", len(persp_records))

# Tabs
tab_news, tab_youtube, tab_persp = st.tabs(["News", "YouTube", "Perspectives"])

# --- News Tab ---

with tab_news:
    if news_df.empty:
        st.info("No news articles found.")
    else:
        nc1, nc2, nc3 = st.columns(3)
        nc1.metric("Total Articles", len(news_df))
        nc2.metric("Unique Sources", news_df["source"].nunique())
        nc3.metric("Latest Article", news_df["date"].max().strftime("%Y-%m-%d"))

        st.subheader("Top Sources")
        source_df = news_df["source"].value_counts().head(10).reset_index()
        source_df.columns = ["source", "count"]

        source_chart = alt.Chart(source_df).mark_bar(
            cornerRadiusTopRight=4, cornerRadiusBottomRight=4
        ).encode(
            x=alt.X("count:Q", title="Articles"),
            y=alt.Y("source:N", sort="-x", title=""),
            color=alt.value(CHART_COLOR),
            tooltip=["source:N", "count:Q"],
        ).properties(height=CHART_HEIGHT)
        st.altair_chart(source_chart, use_container_width=True)

        st.subheader("Recent Articles")
        display_df = news_df[["title", "link", "source", "date"]].copy()
        display_df = display_df.sort_values("date", ascending=False)
        display_df["date"] = display_df["date"].dt.strftime("%Y-%m-%d")
        st.dataframe(
            display_df,
            use_container_width=True,
            hide_index=True,
            column_config={
                "title": st.column_config.TextColumn("Title", width="large"),
                "link": st.column_config.LinkColumn("Link", display_text="Open"),
                "source": st.column_config.TextColumn("Source", width="medium"),
                "date": st.column_config.TextColumn("Date", width="small"),
            },
        )

# --- YouTube Tab ---

with tab_youtube:
    if yt_df.empty:
        st.info("No YouTube videos found.")
    else:
        total_views = int(yt_df["views"].sum())
        yc1, yc2, yc3 = st.columns(3)
        yc1.metric("Total Videos", len(yt_df))
        yc2.metric("Unique Channels", yt_df["channel"].nunique())
        yc3.metric("Total Views", f"{total_views:,}")

        st.subheader("Views by Channel")
        channel_df = yt_df.groupby("channel")["views"].sum().reset_index()
        channel_df = channel_df.sort_values("views", ascending=False).head(10)

        channel_chart = alt.Chart(channel_df).mark_bar(
            cornerRadiusTopRight=4, cornerRadiusBottomRight=4
        ).encode(
            x=alt.X("views:Q", title="Views", axis=alt.Axis(format="~s")),
            y=alt.Y("channel:N", sort="-x", title=""),
            color=alt.value(CHART_COLOR),
            tooltip=["channel:N", alt.Tooltip("views:Q", format=",")],
        ).properties(height=CHART_HEIGHT)
        st.altair_chart(channel_chart, use_container_width=True)

        st.subheader("Top Videos")
        display_df = yt_df[["title", "link", "channel", "views", "date"]].copy()
        display_df = display_df.sort_values("views", ascending=False)
        display_df["date"] = display_df["date"].dt.strftime("%Y-%m-%d")
        st.dataframe(
            display_df,
            use_container_width=True,
            hide_index=True,
            column_config={
                "title": st.column_config.TextColumn("Title", width="large"),
                "link": st.column_config.LinkColumn("Link", display_text="Watch"),
                "channel": st.column_config.TextColumn("Channel", width="medium"),
                "views": st.column_config.NumberColumn("Views", format="%d"),
                "date": st.column_config.TextColumn("Date", width="small"),
            },
        )

# --- Perspectives Tab ---

with tab_persp:
    if persp_df.empty:
        st.info("No perspectives found.")
    else:
        platforms = persp_df["source"].nunique()

        pc1, pc2 = st.columns(2)
        pc1.metric("Total Perspectives", len(persp_df))
        pc2.metric("Platforms", platforms)

        col_left, col_right = st.columns([3, 2])

        with col_left:
            st.subheader("Recent Discussions")
            display_df = persp_df[["title", "link", "source", "author", "date"]].copy()
            display_df = display_df.sort_values("date", ascending=False)
            display_df["date"] = display_df["date"].dt.strftime("%Y-%m-%d")
            st.dataframe(
                display_df,
                use_container_width=True,
                hide_index=True,
                column_config={
                    "title": st.column_config.TextColumn("Title", width="large"),
                    "link": st.column_config.LinkColumn("Link", display_text="Open"),
                    "source": st.column_config.TextColumn("Platform", width="small"),
                    "author": st.column_config.TextColumn("Author", width="medium"),
                    "date": st.column_config.TextColumn("Date", width="small"),
                },
            )

        with col_right:
            st.subheader("Mentions by Platform")
            platform_df = persp_df["source"].value_counts().reset_index()
            platform_df.columns = ["source", "count"]

            platform_chart = alt.Chart(platform_df).mark_arc(
                innerRadius=60, outerRadius=120
            ).encode(
                theta=alt.Theta("count:Q"),
                color=alt.Color("source:N", legend=alt.Legend(title="Platform")),
                tooltip=["source:N", "count:Q"],
            ).properties(height=CHART_HEIGHT)
            st.altair_chart(platform_chart, use_container_width=True)
