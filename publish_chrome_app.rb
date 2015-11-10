require 'json'
# require 'pry'

STDOUT.sync = true

module PublishChromeApp
  CLIENT_ID = '231041669423-6epg7kt1j1qm15tjn0taumtotgh2nvsn.apps.googleusercontent.com'
  CLIENT_SECRET = 'RaUFWkQfppV7y1BVkHIIYlOM'
  REFRESH_TOKEN = '1/emk_yDLwENtJIVm4mWCobZKt3Zt9CPn5AGFsDCbMP4I'

  STAGING_APP_ID = 'lpfpminhdepambpbepajinmnpipofgfo'
  PROD_APP_ID = 'ifnadmakmckbjjhbnjcjpfeeljhhmgib'

  module_function

  def access_token!
    puts 'retrieving access token via refresh token'

    access_token_json = `curl "https://accounts.google.com/o/oauth2/token" \
      -d "client_id=#{CLIENT_ID}&client_secret=#{CLIENT_SECRET}&refresh_token=#{REFRESH_TOKEN}&grant_type=refresh_token"`

    access_token = JSON.parse(access_token_json)['access_token']
    fail 'Access token not found' if !access_token
    access_token
  end

  def archive_name(pwd)
    manifest_path = File.expand_path(File.join(pwd, 'app/manifest.json'))
    manifest = JSON.parse(File.read(manifest_path))
    version = manifest['version']
    "Archive#{version}.zip"
  end

  def build_archive!(environment, pwd)
    puts 'building local archive zip file'

    archive_name = archive_name(pwd)
    archive_path = File.expand_path(File.join(pwd, 'archives', environment, archive_name))
    # fail "Archive file #{archive_name} already exists!" if File.exist?(archive_path)

    fail unless system "cd #{pwd} && mkdir -p archives/#{environment}"
    fail unless system "cd #{pwd} && rm -rf archive"
    fail unless system "cd #{pwd} && cp -r app archive"
    fail unless system "cd #{pwd} && cp config.#{environment}.js archive/javascripts/config.js"
    fail unless system "cd #{pwd} && rm -f #{archive_path}"
    fail unless system "cd #{pwd} && zip -r #{archive_path} archive"
    fail unless system "cd #{pwd} && rm -rf archive"

    archive_path
  end

  def upload_archive!(archive_file_path, access_token, app_id)
    puts 'uploading archive'

    upload_response_json = `curl \
    -H "Authorization: Bearer #{access_token}"  \
    -H "x-goog-api-version: 2" \
    -X PUT \
    -T #{archive_file_path} \
    -v \
    https://www.googleapis.com/upload/chromewebstore/v1.1/items/#{app_id}`
    puts upload_response_json

    upload_response = JSON.parse(upload_response_json)
    fail upload_response['itemError'].to_s if upload_response['uploadState'] != 'SUCCESS'
  end

  def publish_archive!(access_token, app_id)
    puts 'publishing archive'

    publish_response_json = `curl \
    -H "Authorization: Bearer #{access_token}"  \
    -H "x-goog-api-version: 2" \
    -H "Content-Length: 0" \
    -X POST \
    -v \
    https://www.googleapis.com/chromewebstore/v1.1/items/#{app_id}/publish`
    puts publish_response_json

    publish_response = JSON.parse(publish_response_json)
    fail publish_response['statusDetail'].to_s if publish_response['status'] != ["OK"]
  end

  def publish_app(environment, pwd)
    archive_file_path = build_archive!(environment, pwd)

    if environment == 'staging'
      access_token = access_token!
      upload_archive!(archive_file_path, access_token, STAGING_APP_ID)
      publish_archive!(access_token, STAGING_APP_ID)
    elsif environment == 'prod'
      access_token = access_token!
      upload_archive!(archive_file_path, access_token, PROD_APP_ID)
      publish_archive!(access_token, PROD_APP_ID)
    end
  end
end

environment = ARGV[0] || 'prod'
pwd = ARGV[1] || '.'

environemnt_enum = %w(dev staging prod)
fail 'Valid values for environment are: ' + environemnt_enum unless environemnt_enum.include? environment

puts PublishChromeApp.publish_app(environment, pwd)
