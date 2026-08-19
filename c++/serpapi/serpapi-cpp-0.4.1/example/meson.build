
executable('google_example',
           'google_example.cpp',
           install : false,
           link_with : [libserpapi],
           include_directories : incdirs,
           dependencies : [
            dependency('libcurl'),
            dependency('RapidJSON')
           ]
           )
