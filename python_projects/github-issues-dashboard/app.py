import os
import re
from datetime import datetime, timezone

import requests
import altair as alt
import pandas as pd
import streamlit as st

# Constants

BASE_URL = "https://api.github.com"
GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN", "")


# Fetch

def fetch_issues_by_state(owner, repo, state, headers):
    """Fetch all issues for a given state (open/closed), handling pagination."""
    issues = []
    page = 1

    while True:
        response = requests.get(
            f"{BASE_URL}/repos/{owner}/{repo}/issues",
            headers=headers,
            params={"state": state, "per_page": 100, "page": page},
        )

        # GitHub returns 422 when pagination exceeds ~1000 results
        if response.status_code == 422:
            break

        # Rate limit exceeded
        if response.status_code in (403, 429):
            raise Exception(
                "GitHub API rate limit exceeded. "
                "Wait a few minutes and try again, or check your GITHUB_TOKEN."
            )

        response.raise_for_status()
        data = response.json()

        if not data:
            break

        for issue in data:
            if "pull_request" not in issue:
                issues.append(issue)

        page += 1

    return issues


@st.cache_data(ttl=300)
def fetch_all_issues(owner, repo):
    """Fetch all issues from the repo, excluding pull requests."""
    headers = {}
    if GITHUB_TOKEN:
        headers["Authorization"] = f"Bearer {GITHUB_TOKEN}"

    # Fetch open and closed separately to maximize results.
    # GitHub caps pagination at ~1000 results per query,
    # so splitting by state lets us get up to 2000 issues.
    open_issues = fetch_issues_by_state(owner, repo, "open", headers)
    closed_issues = fetch_issues_by_state(owner, repo, "closed", headers)

    return open_issues + closed_issues


# Transform

def transform_issue(issue):
    """Convert a raw GitHub issue dict into a structured record."""
    created = datetime.fromisoformat(issue["created_at"].replace("Z", "+00:00"))
    age_days = (datetime.now(timezone.utc) - created).days
    labels = [label["name"] for label in issue.get("labels", [])]

    # Extract service from title prefix like "[Google Search]"
    match = re.search(r"\[(.+?)\]", issue["title"])
    service = match.group(1) if match else "General"

    # Extract status and type from label prefixes
    status = next((l.split(": ", 1)[1] for l in labels if l.startswith("status:")), "none")
    type_ = next((l.split(": ", 1)[1] for l in labels if l.startswith("type:")), "none")

    return {
        "number": issue["number"],
        "title": issue["title"],
        "state": issue["state"],
        "created_at": created.strftime("%Y-%m-%d"),
        "age_days": age_days,
        "labels": labels,
        "service": service,
        "status": status,
        "type": type_,
    }


# Aging buckets

def age_bucket(days):
    """Categorize issue age into human-readable buckets."""
    if days < 7:
        return "< 7 days"
    elif days < 30:
        return "7-30 days"
    elif days < 90:
        return "30-90 days"
    elif days < 180:
        return "90-180 days"
    elif days < 365:
        return "180-365 days"
    else:
        return "> 365 days"


# Streamlit Dashboard

st.set_page_config(page_title="GitHub Issues Dashboard", layout="wide")
st.title("GitHub Issues Dashboard")

# Repository selector
with st.form("repo_form"):
    col_owner, col_repo, col_btn = st.columns([2, 2, 1])
    with col_owner:
        owner = st.text_input("Owner", value="serpapi")
    with col_repo:
        repo = st.text_input("Repository", value="public-roadmap")
    with col_btn:
        st.markdown("<br>", unsafe_allow_html=True)
        submitted = st.form_submit_button("Fetch Issues")

# Fetch and transform
try:
    raw_issues = fetch_all_issues(owner, repo)
except Exception as e:
    st.error(str(e))
    st.stop()

if not raw_issues:
    st.warning(f"No issues found in {owner}/{repo}. Check that the repository exists and is public.")
    st.stop()

records = [transform_issue(issue) for issue in raw_issues]
df = pd.DataFrame(records)

# Metrics row
total = len(df)
open_count = len(df[df["state"] == "open"])
closed_count = len(df[df["state"] == "closed"])

col1, col2, col3 = st.columns(3)
col1.metric("Total Issues", total)
col2.metric("Open", open_count)
col3.metric("Closed", closed_count)

# Issues by Status & Issues by Type (side by side)

col_left, col_right = st.columns(2)

with col_left:
    st.subheader("Issues by Status")
    status_df = df["status"].value_counts().reset_index()
    status_df.columns = ["status", "count"]

    status_chart = alt.Chart(status_df).mark_bar(cornerRadiusTopLeft=4, cornerRadiusTopRight=4).encode(
        x=alt.X("status:N", sort="-y", title="", axis=alt.Axis(labelAngle=-45)),
        y=alt.Y("count:Q", title="Issues"),
        color=alt.value("#4A90D9"),
    ).properties(height=350)
    st.altair_chart(status_chart, use_container_width=True)

with col_right:
    st.subheader("Issues by Type")
    type_df = df[df["type"] != "none"]["type"].value_counts().reset_index()
    type_df.columns = ["type", "count"]

    if not type_df.empty:
        donut = alt.Chart(type_df).mark_arc(innerRadius=60, outerRadius=120).encode(
            theta=alt.Theta("count:Q"),
            color=alt.Color("type:N", legend=alt.Legend(title="Type")),
            tooltip=["type:N", "count:Q"],
        ).properties(height=350)
        st.altair_chart(donut, use_container_width=True)
    else:
        st.info("No type labels found in this repository.")

# Issues Opened Over Time

st.subheader("Issues Over Time")
df["month"] = pd.to_datetime(df["created_at"]).dt.to_period("M").astype(str)
monthly_state = df.groupby(["month", "state"]).size().reset_index(name="count")

timeline = alt.Chart(monthly_state).mark_area(opacity=0.6).encode(
    x=alt.X("month:N", title="", axis=alt.Axis(labelAngle=-45, values=monthly_state["month"].unique()[::3].tolist())),
    y=alt.Y("count:Q", title="Issues"),
    color=alt.Color("state:N", legend=alt.Legend(title="State")),
    tooltip=["month:N", "state:N", "count:Q"],
).properties(height=350)
st.altair_chart(timeline, use_container_width=True)

# Top 15 Services & Issue Aging (side by side)

col_left2, col_right2 = st.columns(2)

with col_left2:
    st.subheader("Top 15 Services")
    service_df = df["service"].value_counts().head(15).reset_index()
    service_df.columns = ["service", "count"]

    service_chart = alt.Chart(service_df).mark_bar(cornerRadiusTopRight=4, cornerRadiusBottomRight=4).encode(
        x=alt.X("count:Q", title="Issues"),
        y=alt.Y("service:N", sort="-x", title=""),
        color=alt.value("#4A90D9"),
        tooltip=["service:N", "count:Q"],
    ).properties(height=450)
    st.altair_chart(service_chart, use_container_width=True)

with col_right2:
    st.subheader("Issue Aging")
    open_df = df[df["state"] == "open"].copy()
    open_df["age_bucket"] = open_df["age_days"].apply(age_bucket)

    bucket_order = ["< 7d", "7-30d", "30-90d", "90-180d", "180-365d", "365d+"]
    label_map = {
        "< 7 days": "< 7d", "7-30 days": "7-30d", "30-90 days": "30-90d",
        "90-180 days": "90-180d", "180-365 days": "180-365d", "> 365 days": "365d+",
    }
    open_df["age_bucket"] = open_df["age_bucket"].map(label_map)
    aging_df = open_df["age_bucket"].value_counts().reindex(bucket_order, fill_value=0).reset_index()
    aging_df.columns = ["bucket", "count"]

    aging_chart = alt.Chart(aging_df).mark_bar(cornerRadiusTopLeft=4, cornerRadiusTopRight=4).encode(
        x=alt.X("bucket:N", sort=bucket_order, title="", axis=alt.Axis(labelAngle=-45)),
        y=alt.Y("count:Q", title="Issues"),
        color=alt.value("#4A90D9"),
        tooltip=["bucket:N", "count:Q"],
    ).properties(height=450)
    st.altair_chart(aging_chart, use_container_width=True)
