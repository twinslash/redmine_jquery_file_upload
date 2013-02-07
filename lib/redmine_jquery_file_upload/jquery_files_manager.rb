module RedmineJqueryFileUpload

  module JqueryFilesManager
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

      end
    end
  end

end
