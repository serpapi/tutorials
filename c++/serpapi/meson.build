project('hello', 'cpp', version: '0.1', default_options: ['cpp_std=c++17'])

rapidjson_dep = dependency('RapidJSON', required: false)
if not rapidjson_dep.found()
  rapidjson_dep = declare_dependency(
    include_directories: include_directories('/opt/homebrew/include')
  )
endif

serpapi_dep = dependency('serpapi')

executable('hello', 'hello.cpp', dependencies: [rapidjson_dep, serpapi_dep])
