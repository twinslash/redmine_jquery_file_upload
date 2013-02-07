Rails.configuration.to_prepare do
  require_dependency 'setting'
  require_dependency 'redmine_jquery_file_upload/jquery_files_manager'
  require_dependency 'redmine_jquery_file_upload/jquery_views_manager'
  require_dependency 'redmine_jquery_file_upload/patches/controllers/files_controller_patch'
end

module RedmineJqueryFileUpload
  def self.tmpdir
    File.join(Rails.root, 'public', Setting.plugin_redmine_jquery_file_upload[:tmpdir])
  end

  def self.mktmpdir
    root_path = File.join(Rails.root, 'public')
    Setting.plugin_redmine_jquery_file_upload[:tmpdir].split('/').inject(root_path) do |path, folder_name|
      path = File.join(path, folder_name)
      Dir.mkdir(path) unless Dir.exist?(path)
      path
    end
  end

end
