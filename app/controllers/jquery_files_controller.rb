class JqueryFilesController < ApplicationController
  unloadable

  def index
    head :ok
  end

  def create
    session[params[:tempFolderName]] ||= 0
    @tempFolderPath = mkfolder(params[:tempFolderName])
    @responce = []
    params[:files].each do |file|
      session[params[:tempFolderName]] += 1
      store(file)
    end

    respond_to do |format|
      # html response is for browsers using iframe sollution
      format.html {
        render json: @responce.to_json,
        content_type: 'text/html',
        layout: false
      }
      format.json { render json: @responce.to_json }
    end
  end

  def destroy
    filePath = File.join(mkfolder(params[:tempFolderName]), params[:id])
    metadataFilePath = File.join(mkfolder(params[:tempFolderName]), "#{params[:id]}_metadata")
    File.delete(filePath) if File.exist?(filePath)
    File.delete(metadataFilePath) if File.exist?(metadataFilePath)
    head :ok
  end

  private

  def sanitize_filename(filename)
    filename.gsub(%r{[^\w\s\-]}, '').gsub(%r{\s+(\-+\s*)?}, '-')
  end

  def mkfolder(folder_name)
    path = File.join(RedmineJqueryFileUpload.tmpdir, sanitize_filename(folder_name))
    Dir.mkdir(path) unless Dir.exist?(path)
    path
  end

  def store(file)
    f = File.open(File.join(@tempFolderPath, session[params[:tempFolderName]].to_s), 'w')
    f.write(file.tempfile.read)
    f.close
    store_metadata file
    append_to_responce file
  end

  def store_metadata(file)
    f = File.open(File.join(@tempFolderPath, "#{session[params[:tempFolderName]].to_s}_metadata"), 'w')
    f.write(file.to_json)
    f.close
  end

  def append_to_responce(file)
    @responce << { url: File.join(@tempFolderPath, session[params[:tempFolderName]].to_s),
                   name: file.original_filename,
                   size: file.tempfile.size,
                   delete_url: "/jquery_files/#{session[params[:tempFolderName]]}?tempFolderName=#{params[:tempFolderName]}",
                   delete_type: 'DELETE',
                   tempFileOrder: session[params[:tempFolderName]] }
  end
end
