executable('oobt',
           'main.cpp',
           install : false,
           link_with : [libserpapi],
           include_directories : incdirs,
           dependencies : [
            dependency('libcurl'),
            dependency('RapidJSON')
           ]
           )
