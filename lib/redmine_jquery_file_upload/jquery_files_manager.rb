module RedmineJqueryFileUpload
  module JqueryFilesManager
    def self.sanitize_filename(filename)
        filename.gsub(%r{[^\w\s\-]}, '').gsub(%r{\s+(\-+\s*)?}, '-')
    end

    private

    def sanitize_filename(filename)
      RedmineJqueryFileUpload::JqueryFilesManager::sanitize_filename(filename)
    end

    def mkfolder(folder_name)
      path = File.join(RedmineJqueryFileUpload.tmpdir, folder_name)
      Dir.mkdir(path) unless Dir.exist?(path)
      path
    end

    def store(file, order, folder)
      FileUtils.cp file.tempfile.path, File.join(folder, "#{order}.data")
    end

    def store_metadata(file, order, folder)
      File.open(File.join(folder, "#{order}.metadata"), 'w') do |f|
        metadata = { filename: file.original_filename,
                     type: file.content_type,
                     head: file.headers }
        f.write(metadata.to_json)
      end
    end

    def to_responce(file, order, folder, token)
      { url: File.join(folder, order),
        name: file.original_filename,
        size: file.tempfile.size,
        delete_url: "/jquery_files/#{order}?tempFolderPath=#{folder}&authenticity_token=#{token}",
        delete_type: 'DELETE',
        tempFileOrder: order }
    end

  end
end
