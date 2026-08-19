#include <cstdint>
#include <limits>
#include <string>

namespace serpapi {
size_t callback(const char* in, size_t size, size_t num, std::string* out) {
  if (!out || !in) return 0;
  if (size == 0 || num == 0) return 0;
  if (size > std::numeric_limits<size_t>::max() / num) return 0;

  const size_t totalBytes = size * num;
  try {
    out->append(in, totalBytes);
    return totalBytes;
  } catch (const std::exception&) {
    return 0;
  }
}
} // namespace serpapi
