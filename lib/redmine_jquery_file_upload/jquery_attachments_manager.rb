module RedmineJqueryFileUpload

  module JqueryAttachmentsManager
    def self.included(base)
      base.extend ClassMethods
      base.send(:include, InstanceMethods)
    end

    module ClassMethods
      def loads_jquery_attachments_before(*actions)
        before_filter :load_jquery_attachments, only: actions
      end
    end

    module InstanceMethods

      private

      def load_jquery_attachments
        folder_name = RedmineJqueryFileUpload::JqueryFilesManager.sanitize_filename(params[:tempFolderName])
        return if folder_name.blank?
        folder = File.join(RedmineJqueryFileUpload.tmpdir, folder_name)
        return unless Dir.exist?(folder)
        file, tempfile = nil
        params[:attachments].each do |order, _|
          begin
            tempfile = File.open(File.join(folder, "#{order}.data"), 'rb')

            File.open(File.join(folder, "#{order}.metadata"), 'rb') do |f|
              opts = JSON::parse(f.read).symbolize_keys.merge(tempfile: tempfile)
              file = ActionDispatch::Http::UploadedFile.new opts
            end
          rescue Errno::ENOENT
          end
          params[:attachments][order][:file] = file
        end
        FileUtils.rm_rf folder
      end

    end

  end

end
