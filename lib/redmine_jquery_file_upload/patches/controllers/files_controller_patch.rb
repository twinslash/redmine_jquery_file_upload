module RedmineJqueryFileUpload
  module Patches
    module Controllers

      module FilesControllerPatch
        def self.included(base)
          base.class_eval do
            include RedmineJqueryFileUpload::JqueryViewsManager
            replace_attachments_form_for [:new]

            include InstanceMethods
          end
        end

        module ClassMethods
        end

        module InstanceMethods

        end
      end

    end
  end
end


unless FilesController.included_modules.include?(RedmineJqueryFileUpload::Patches::Controllers::FilesControllerPatch)
  FilesController.send(:include, RedmineJqueryFileUpload::Patches::Controllers::FilesControllerPatch)
end
