#include <iostream>
#include <map>
#include <rapidjson/document.h>
#include <rapidjson/prettywriter.h>
#include <rapidjson/stringbuffer.h>
#include <serpapi.hpp>
#include <string>

int main() {
  const char *env_p = std::getenv("SERPAPI_KEY");
  if (env_p == nullptr) {
    std::cout << "SERPAPI_KEY not set, skipping example" << std::endl;
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

  rapidjson::StringBuffer buffer;
  rapidjson::PrettyWriter<rapidjson::StringBuffer> writer(buffer);
  d.Accept(writer);

  std::cout << "Search Results:" << std::endl;
  std::cout << buffer.GetString() << std::endl;

  if (d.HasMember("search_metadata") && d["search_metadata"].HasMember("id")) {
    std::string id = d["search_metadata"]["id"].GetString();
    std::cout << "\nArchiving search ID: " << id << std::endl;
    rapidjson::Document archived = client.search_archive(id);

    if (archived.HasMember("search_metadata") &&
        archived["search_metadata"]["status"] == "Success") {
      std::cout << "Successfully retrieved from archive." << std::endl;
    }
  }

  return 0;
}
