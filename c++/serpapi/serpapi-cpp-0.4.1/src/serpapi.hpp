/***
 * Run search engine powered by SerpApi
 */
#ifndef SERPAPI
#define SERPAPI

#include "rapidjson/document.h"
#include <curl/curl.h>
#include <map>
#include <string>

namespace serpapi {

struct GetResponse {
  int httpCode;
  std::string payload;
};

class Client {

  std::map<std::string, std::string> parameter;
  int timeout = 60;

public:
  explicit Client(const std::map<std::string, std::string> &parameter);
  ~Client();

  void setTimeout(int seconds) { timeout = seconds; }

  rapidjson::Document
  search(const std::map<std::string, std::string> &parameter = {});

  std::string html(const std::map<std::string, std::string> &parameter = {});

  rapidjson::Document search_archive(const std::string &search_id);

  rapidjson::Document
  account(const std::map<std::string, std::string> &parameter = {});

  rapidjson::Document
  location(const std::map<std::string, std::string> &parameter = {});

private:
  rapidjson::Document json(const std::string &uri,
                           const std::map<std::string, std::string> &parameter);

  std::string url(CURL *curl, const std::string &output,
                  const std::map<std::string, std::string> &parameter);

  GetResponse get(const std::string &uri, const std::string &output,
                  const std::map<std::string, std::string> &parameter);
};
} // namespace serpapi

#endif
