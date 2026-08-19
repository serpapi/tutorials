#include "../src/callback.hpp"
#include "../src/serpapi.hpp"
#include <gtest/gtest.h>
#include <atomic>
#include <climits>
#include <thread>
#include <vector>

// ── callback ──────────────────────────────────────────────────────────────────

TEST(callback, null_out_returns_zero) {
  EXPECT_EQ(serpapi::callback("data", 4, 1, nullptr), 0u);
}

TEST(callback, null_in_returns_zero) {
  std::string s;
  EXPECT_EQ(serpapi::callback(nullptr, 4, 1, &s), 0u);
  EXPECT_TRUE(s.empty());
}

TEST(callback, zero_size_returns_zero) {
  std::string s;
  EXPECT_EQ(serpapi::callback("data", 0, 1, &s), 0u);
  EXPECT_TRUE(s.empty());
}

TEST(callback, zero_num_returns_zero) {
  std::string s;
  EXPECT_EQ(serpapi::callback("data", 1, 0, &s), 0u);
  EXPECT_TRUE(s.empty());
}

TEST(callback, overflow_returns_zero) {
  std::string s;
  EXPECT_EQ(serpapi::callback("data", std::numeric_limits<size_t>::max(), 2, &s), 0u);
  EXPECT_TRUE(s.empty());
}

TEST(callback, appends_data) {
  std::string s;
  size_t n = serpapi::callback("hello", 5, 1, &s);
  EXPECT_EQ(n, 5u);
  EXPECT_EQ(s, "hello");
}

TEST(callback, size_times_num_appends_correctly) {
  std::string s;
  const char data[] = {'a', 'b', 'c', 'd', 'e', 'f'};
  size_t n = serpapi::callback(data, 2, 3, &s);
  EXPECT_EQ(n, 6u);
  EXPECT_EQ(s.size(), 6u);
}

TEST(callback, incremental_chunks_accumulate) {
  std::string s;
  serpapi::callback("foo", 3, 1, &s);
  serpapi::callback("bar", 3, 1, &s);
  EXPECT_EQ(s, "foobar");
}

// ── Client construction ───────────────────────────────────────────────────────

TEST(client_unit, construct_empty_params) {
  EXPECT_NO_THROW(serpapi::Client client({}));
}

TEST(client_unit, construct_with_params) {
  EXPECT_NO_THROW(serpapi::Client client({{"api_key", "test"}, {"engine", "google"}}));
}

TEST(client_unit, set_timeout_positive) {
  serpapi::Client client({});
  EXPECT_NO_THROW(client.setTimeout(30));
}

TEST(client_unit, set_timeout_zero) {
  serpapi::Client client({});
  EXPECT_NO_THROW(client.setTimeout(0));
}

// ── Edge cases (network required – uses location which needs no API key) ──────

TEST(client_unit, location_special_chars_in_query) {
  serpapi::Client client({});
  // & and = in the query value must be percent-encoded, not break the URL
  rapidjson::Document d = client.location({{"q", "Austin & Texas"}, {"limit", "1"}});
  EXPECT_FALSE(d.HasParseError());
  EXPECT_TRUE(d.IsArray());
}

TEST(client_unit, location_empty_query) {
  serpapi::Client client({});
  // Empty string value should not crash URL encoding
  rapidjson::Document d = client.location({{"q", ""}, {"limit", "1"}});
  EXPECT_FALSE(d.HasParseError());
}

TEST(client_unit, default_params_merged_with_call_params) {
  // Default params set at construction should be sent alongside call params
  serpapi::Client client({{"limit", "1"}});
  rapidjson::Document d = client.location({{"q", "Austin"}});
  EXPECT_FALSE(d.HasParseError());
  EXPECT_TRUE(d.IsArray());
  // Only 1 result because of default limit=1
  EXPECT_LE(d.GetArray().Size(), 1u);
}

// ── Response integrity ────────────────────────────────────────────────────────

TEST(client_unit, search_returns_valid_json) {
  // Verify we always get a parseable JSON object, never a raw crash or garbage
  serpapi::Client client({{"engine", "google"}});
  rapidjson::Document d = client.search({{"q", "coffee"}});
  EXPECT_FALSE(d.HasParseError());
  EXPECT_TRUE(d.IsObject());
}

// ── Thread safety ─────────────────────────────────────────────────────────────

TEST(client_unit, concurrent_location_calls_are_safe) {
  // Verifies std::call_once CURL init and shared Client are race-free
  serpapi::Client client({});
  std::map<std::string, std::string> params = {{"q", "Austin"}, {"limit", "1"}};
  std::atomic<int> success{0};

  std::vector<std::thread> threads;
  threads.reserve(4);
  for (int i = 0; i < 4; ++i) {
    threads.emplace_back([&]() {
      rapidjson::Document d = client.location(params);
      if (!d.HasParseError() && d.IsArray())
        ++success;
    });
  }
  for (auto& t : threads) t.join();

  EXPECT_EQ(success.load(), 4);
}
