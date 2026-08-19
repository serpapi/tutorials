#include <iostream>
#include <map>
#include <string>
#include <serpapi.hpp>
#include <rapidjson/document.h>
#include <rapidjson/stringbuffer.h>
#include <rapidjson/prettywriter.h>

int main() {
    serpapi::Client client({
        {"api_key", "1f1f1ae990e38f5b3717b14db5b8dc98de9e28c05a61bda5ca5c78d0aa549c7e"},
        {"engine", "google"}
    });

    rapidjson::Document results = client.search({
        {"q", "Coffee"},
        {"location", "Austin, Texas, United States"},
        {"hl", "en"},
        {"gl", "us"},
        {"google_domain", "google.com"}
    });

    rapidjson::StringBuffer buffer;
    rapidjson::PrettyWriter<rapidjson::StringBuffer> writer(buffer);
    results.Accept(writer);

    std::cout << buffer.GetString() << '\n';
}