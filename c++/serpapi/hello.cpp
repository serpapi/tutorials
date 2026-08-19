#include <iostream>
#include <map>
#include <string>
#include <serpapi.hpp>
#include <rapidjson/document.h>
#include <rapidjson/stringbuffer.h>
#include <rapidjson/prettywriter.h>

int main() {
    serpapi::Client client({
        {"api_key", "secret_api_key"},
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