module RedmineJqueryFileUpload

  module JqueryAttachmentsManager
    def self.included(base)
      base.extend ClassMethods
      base.send(:include, InstanceMethods)
    end

    module ClassMethods
      def loads_jquery_attachments_before(actions = [])
        before_filter :load_jquery_attachments, only: actions
      end
    end

    module InstanceMethods

      private

      def load_jquery_attachments
        Dir.glob(File.join(RedmineJqueryFileUpload.tmpdir, params[:tempFolderName])).select do |path|

        end
      end
    end

  end

end
