# Automate serpapi C++ library
# 

task default: [:clean, :setup, :build, :test, :lint, :coverage, :example, :oobt] do
	puts "all good ready to release"
	puts " next step: rake release"
end

task :clean do
	sh('rm -rf build/')
end

def pkg_config_env
  pkg_paths = [
     "/opt/homebrew/lib/pkgconfig",
     "/opt/homebrew/opt/rapidjson/lib/pkgconfig",
     "/opt/homebrew/opt/libcurl/lib/pkgconfig"
  ].select { |path| File.directory?(path) }

  # Append existing PKG_CONFIG_PATH
  existing_path = ENV['PKG_CONFIG_PATH']
  pkg_paths << existing_path if existing_path && !existing_path.empty?

  require 'shellwords'
  "PKG_CONFIG_PATH=#{Shellwords.escape(pkg_paths.join(':'))}"
end

desc('initialize meson build')
task :setup do
  sh("#{pkg_config_env} meson setup --wipe build -Dtests=true")
end

desc('build library')
task :build => FileList['src/*.hpp', 'src/*.cpp'] do
	sh('meson compile -C build')
	sh('cd build && ninja')
end

desc('run test suite')
task :test do
	sh('ninja -C build test')
end

desc('run static analysis')
task :lint do
	rapidjson_inc = `#{pkg_config_env} pkg-config --variable=includedir rapidjson`.strip
	sh("cppcheck src/*.cpp test/*.cpp oobt/*.cpp example/*.cpp -I src -I #{rapidjson_inc} --enable=warning,style,performance,portability --suppress='*:*/rapidjson/*' --suppress=missingIncludeSystem --suppress=unusedFunction --error-exitcode=1")
end

desc('generate coverage report')
task :coverage do
	sh("#{pkg_config_env} meson setup build --wipe -Db_coverage=true -Dtests=true")
	sh('ninja -C build')
	sh('ninja -C build test')
	# Use gcovr directly to focus on src/ and provide a cleaner report
	sh('gcovr -r . --filter src/')
	sh('gcovr -r . --filter src/ -s')
end

task readme: ['README.md.erb'] do
  `erb -T '-' README.md.erb > README.md`
end

desc('generate documentation')
task doc: [:readme]

desc('run examples under build/example')
task :example do
	Dir.glob('build/example/*').each do |file|
		next if file.end_with?('.p')
		sh(file)
	end
end

desc('run oobt under build/oobt')
task :oobt do
	sh('./build/oobt/oobt')
end

desc('release current library')
task release: [:default] do
  require 'shellwords'

  # Extract version from meson.build
  version_match = File.read('meson.build').match(/version\s*:\s*'([^']+)'/)
  abort "Unable to extract version from meson.build. Check version format." unless version_match

  version = version_match[1]
  tag = "v#{version}"

  puts "Releasing #{tag}..."

  # Check if tag already exists
  if `git tag -l #{Shellwords.escape(tag)}`.strip == tag
    puts "Tag #{tag} already exists. Skipping git tag."
  else
    # Ensure working directory is clean
    unless `git status --porcelain`.strip.empty?
      abort "Working directory is not clean. Please commit or stash changes."
    end

    sh "git tag -a #{Shellwords.escape(tag)} -m #{Shellwords.escape("Release #{tag}")}"
    puts "Created tag #{tag}."
  end

  # Create distribution package
  # meson dist performs a build and test in a temporary directory, so it needs the env
  sh "#{pkg_config_env} meson dist -C build"

  puts "\nRelease #{tag} completed successfully!"
  puts "Next steps:"
  puts "1. git push origin #{tag}"
  puts "2. Upload build/meson-dist/serpapi-#{version}.tar.xz to GitHub Releases"
end

namespace :install do
	desc('install dependency on debian AARCH64 and x86 [tested]')
	task :linux do
		sh('sudo apt update -y && sudo apt install -f -y build-essential meson pkg-config curl cmake meson ninja-build libcurl4-openssl-dev rapidjson-dev googletest cppcheck gcovr lcov')
	end

	desc('install dependency on Apple M1 aarch64 [tested]')
	task :apple do
		sh('brew install meson pkg-config curl cmake meson ninja rapidjson googletest cppcheck gcovr lcov')
	end
end
