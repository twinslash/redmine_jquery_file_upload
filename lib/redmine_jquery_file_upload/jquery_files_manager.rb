module RedmineJqueryFileUpload
  module JqueryFilesManager
    private

    def sanitize_filename(filename)
      filename.gsub(%r{[^\w\s\-]}, '').gsub(%r{\s+(\-+\s*)?}, '-')
    end

    def mkfolder(folder_name)
      path = File.join(RedmineJqueryFileUpload.tmpdir, sanitize_filename(folder_name))
      Dir.mkdir(path) unless Dir.exist?(path)
      path
    end

    def store(file, order, folder)
      FileUtils.cp file.tempfile.path, File.join(folder, "#{order}.data")
    end

    def store_metadata(file, order, folder)
      File.open(File.join(folder, "#{order}.metadata"), 'w') do |f|
        f.write(file.to_json)
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
