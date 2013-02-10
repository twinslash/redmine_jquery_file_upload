class JqueryFileUploadHookListener < Redmine::Hook::ViewListener
  def view_layouts_base_html_head(context = {})
      javascript_include_tag 'load-fileupload.js', plugin: 'redmine_jquery_file_upload'
  end
end
