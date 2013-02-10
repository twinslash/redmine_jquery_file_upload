class JqueryFilesController < ApplicationController
  unloadable

  def index
    head :ok
  end

  def new
    render file: File.join(Rails.root, 'plugins', 'redmine_jquery_file_upload', 'app', 'views', 'shared', 'attachments_form'), layout: false
  end

  def create
    response = []
    if params[:tempFileOrder] && params[:files] && params[:tempFileOrder].size.equal?(params[:files].size)
      jquery_files_manager = RedmineJqueryFileUpload::JqueryFilesManager.new(params[:tempFolderName])
      params[:tempFileOrder].each_with_index do |order, index|
        file = params[:files][index]
        jquery_files_manager.store(file, order)
        jquery_files_manager.store_metadata(file, order)
        response << jquery_files_manager.to_responce(file, order, params[:authenticity_token])
      end
    end

    respond_to do |format|
      # html response is for browsers using iframe sollution
      format.html {
        render json: response.to_json,
        content_type: 'text/html',
        layout: false
      }
      format.json { render json: response.to_json }
    end
  end

  def destroy
    filePath = File.join(params[:tempFolderPath], "#{params[:id]}.data")
    metadataFilePath = File.join(params[:tempFolderPath], "#{params[:id]}.metadata")
    File.delete(filePath) if File.exist?(filePath)
    File.delete(metadataFilePath) if File.exist?(metadataFilePath)
    head :ok
  end
end
