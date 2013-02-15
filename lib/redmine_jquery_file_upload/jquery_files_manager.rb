module RedmineJqueryFileUpload
  class JqueryFilesManager

    attr_accessor :folder

    def initialize(folder)
      @folder = folder
      @folder_created = false
    end

    def mkfolder
      folder = self.class.sanitize_filename @folder
      if folder.present?
        path = File.join(RedmineJqueryFileUpload.tmpdir, folder)
        Dir.mkdir(path) unless Dir.exist?(path)
        @folder_created = true
      end
      return @folder_created
    end

    def store(file, order)
      store_file file, order
      store_metadata file, order
    end

    def store_file(file, order)
      mkfolder unless @folder_created
      if @folder_created && (order = self.class.sanitize_filename(order)).present?
        FileUtils.cp file.tempfile.path, File.join(RedmineJqueryFileUpload.tmpdir, @folder, "#{order}.data")
        return true
      end
      return false
    end

    def store_metadata(file, order)
      mkfolder unless @folder_created
      if @folder_created && (order = self.class.sanitize_filename(order)).present?
        File.open(File.join(RedmineJqueryFileUpload.tmpdir, @folder, "#{order}.metadata"), 'w') do |f|
          metadata = { filename: file.original_filename,
                       type: file.content_type,
                       head: file.headers }
          f.write(metadata.to_json)
        end
        return true
      end
      return false
    end

    def delete(order)
      folder = self.class.sanitize_filename(@folder)
      if folder.present?
        filePath = File.join(RedmineJqueryFileUpload.tmpdir, folder, order)
        File.delete("#{filePath}.data") if File.exist?("#{filePath}.data")
        File.delete("#{filePath}.metadata") if File.exist?("#{filePath}.metadata")
        return true
      end
      return false
    end

    def delete_folder
      folder = self.class.sanitize_filename(@folder)
      if folder.present?
        folderPath = File.join(RedmineJqueryFileUpload.tmpdir, folder)
        FileUtils.rm_rf folderPath if Dir.exist?(folderPath)
        return true
      end
      return false
    end

    def to_responce(file, order)
      { url: File.join(RedmineJqueryFileUpload.tmpdir, @folder, order),
        name: file.original_filename,
        size: file.tempfile.size,
        delete_url: "/jquery_files/#{order}?tempFolderName=#{@folder}",
        delete_type: 'DELETE',
        delete_with_credentials: true,
        tempFileOrder: order }
    end

    def self.sanitize_filename(filename)
      filename.to_s.gsub(%r{[^\w\s\-]}, '').gsub(%r{\s+(\-+\s*)?}, '-')
    end

  end
end
