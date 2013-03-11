require_dependency 'redmine_jquery_file_upload/jquery_files_manager'
require_dependency 'redmine_jquery_file_upload/jquery_attachments_manager'
require_dependency 'redmine_jquery_file_upload/hooks/jquery_file_upload_hook_listener'

Rails.configuration.to_prepare do
  RedmineJqueryFileUpload.mktmpdir

  [DocumentsController, FilesController, IssuesController, MessagesController, NewsController, WikiController].each { |controller| controller.send(:include, RedmineJqueryFileUpload::JqueryAttachmentsManager) }

  DocumentsController.class_eval do
    loads_jquery_attachments_before :create, :add_attachment
  end

  FilesController.class_eval do
    loads_jquery_attachments_before :create
  end

  IssuesController.class_eval do
    loads_jquery_attachments_before :create, :update
  end

  MessagesController.class_eval do
    loads_jquery_attachments_before :new, :reply, :edit
  end

  NewsController.class_eval do
    loads_jquery_attachments_before :create, :update
  end

  WikiController.class_eval do
    loads_jquery_attachments_before :update, :add_attachment
  end

end

module RedmineJqueryFileUpload
  def self.tmpdir
    File.join(Rails.root, 'public', Setting.plugin_redmine_jquery_file_upload[:tmpdir])
  end

  def self.mktmpdir
    FileUtils.mkdir_p(self.tmpdir) unless File.exist?(self.tmpdir)
  end
end
