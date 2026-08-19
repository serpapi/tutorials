#include <cassert>
#include <iostream>
#include <map>
#include <rapidjson/document.h>
#include <rapidjson/prettywriter.h>
#include <rapidjson/stringbuffer.h>
#include <serpapi.hpp>
#include <string>

void print_json(const rapidjson::Document &document) {
  rapidjson::StringBuffer buffer;
  rapidjson::PrettyWriter<rapidjson::StringBuffer> writer(buffer);
  document.Accept(writer);
  std::cout << buffer.GetString() << std::endl;
}

int main() {
  const char *env_p = std::getenv("SERPAPI_KEY");
  if (env_p == nullptr) {
    std::cout << "SERPAPI_KEY not set, skipping OOBT" << std::endl;
    return 0;
  }

  std::string apiKey(env_p);
  std::map<std::string, std::string> default_parameter;
  default_parameter["api_key"] = apiKey;
  default_parameter["engine"] = "google";

  serpapi::Client client(default_parameter);

  std::map<std::string, std::string> parameter;
  parameter["q"] = "coffee";
  parameter["location"] = "Austin,TX";

  rapidjson::Document d = client.search(parameter);
  std::cout << "Document loaded" << std::endl;
  print_json(d);

  assert(!d.HasMember("error"));
  assert(d.HasMember("search_metadata"));
  assert(d["search_metadata"]["status"] == "Success");

  std::string status = d["search_metadata"]["status"].GetString();
  std::cout << "Status: " << status << std::endl;

  assert(d["search_metadata"]["id"].IsString());
  std::string id = d["search_metadata"]["id"].GetString();
  std::cout << "Search ID: " << id << std::endl;

  std::cout << "Retrieving from archive..." << id << std::endl;
  rapidjson::Document d2 = client.search_archive(id);

  assert(d2["search_metadata"]["status"] == "Success");
  std::cout << "Successfully retrieved from archive." << std::endl;
  std::cout << "Test passed." << std::endl;

  return 0;
}
