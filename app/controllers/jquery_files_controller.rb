class JqueryFilesController < ApplicationController
  unloadable

  include RedmineJqueryFileUpload::JqueryFilesManager

  def index
    head :ok
  end

  def create
    tempFolderPath = mkfolder(sanitize_filename(params[:tempFolderName]))
    response = []
    params[:tempFileOrder].each_with_index do |order, index|
      order = sanitize_filename(order)
      file = params[:files][index]
      store(file, order, tempFolderPath)
      store_metadata(file, order, tempFolderPath)
      response << to_responce(file, order, tempFolderPath, params[:authenticity_token])
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
