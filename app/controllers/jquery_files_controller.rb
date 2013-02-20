class JqueryFilesController < ApplicationController
  require 'RMagick'
  require 'open-uri'

  unloadable

  def index
    head :ok
  end

  def new
    render file: File.join(Rails.root, 'plugins', 'redmine_jquery_file_upload', 'app', 'views', 'redmine_jquery_file_upload', 'attachments_form'), layout: false
  end

  def create
    response = []
    if params[:tempFileOrder] && params[:files] && params[:tempFileOrder].size.equal?(params[:files].size)
      jquery_files_manager = RedmineJqueryFileUpload::JqueryFilesManager.new(params[:tempFolderName])
      params[:tempFileOrder].each_with_index do |order, index|
        file = params[:files][index]
        jquery_files_manager.store(file, order)
        response << jquery_files_manager.to_responce(file, order)
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
    RedmineJqueryFileUpload::JqueryFilesManager.new(params[:tempFolderName]).delete(params[:id])
    head :ok
  end

  def destroy_tempfolder
    RedmineJqueryFileUpload::JqueryFilesManager.new(params[:id]).delete_folder
  end

  def crop
    if params[:image].is_a? String
      orig_img = Magick::ImageList.new(params[:image])
    elsif params[:image].is_a? ActionDispatch::Http::UploadedFile
      orig_img = Magick::ImageList.new(params[:image].tempfile.path)
    else
      render nothing: true
      return
    end
    orig_img.crop!(*params[:crop_area].split(',').map(&:to_i))
    send_data orig_img.to_blob, type: orig_img.first.mime_type, disposition: 'inline'
  end
end
