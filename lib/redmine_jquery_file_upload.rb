require_dependency 'redmine_jquery_file_upload/jquery_files_manager'
require_dependency 'redmine_jquery_file_upload/jquery_attachments_manager'
require_dependency 'redmine_jquery_file_upload/jquery_views_manager'
require_dependency 'redmine_jquery_file_upload/patches/controllers/files_controller_patch'

Rails.configuration.to_prepare do
  FilesController.send(:include, RedmineJqueryFileUpload::Patches::Controllers::FilesControllerPatch)
  RedmineJqueryFileUpload.mktmpdir
end

module RedmineJqueryFileUpload
  def self.tmpdir
    File.join(Rails.root, 'public', Setting.plugin_redmine_jquery_file_upload[:tmpdir])
  end

  def self.mktmpdir
    FileUtils.mkdir_p(self.tmpdir) unless Dir.exist?(self.tmpdir)
  end

end
