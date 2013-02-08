require 'redmine_jquery_file_upload'

Redmine::Plugin.register :redmine_jquery_file_upload do
  name 'Redmine Jquery File Upload plugin'
  author 'Dmitry Kovalenok'
  description 'This plugin replace native file uploader by advanced JqueryFileUploader, which allows multiple file upload and drag&drop'
  version '0.0.1'
  url 'https://github.com/twinslash/redmine_jquery_file_upload'
  author_url 'https://github.com/twinslash'
  settings default: { tmpdir: 'tmp/jquery_files' }
end
