#ifndef SERPAPI_CALLBACK_HPP
#define SERPAPI_CALLBACK_HPP

#include <cstddef>
#include <string>

namespace serpapi {
size_t callback(const char *in, size_t size, size_t num, std::string *out);
}

#endif
