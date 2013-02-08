module RedmineJqueryFileUpload
  module JqueryViewsManager

    def self.included(base)
      base.extend ClassMethods
      base.send(:include, InstanceMethods)
    end

    module ClassMethods
      def replace_attachments_form_for(*actions)
        actions.each do |action|
          define_method "#{action}_with_jquery_file_uploader" do
            send "#{action}_without_jquery_file_uploader"
            template_path = File.join(Rails.root, lookup_context.find("#{controller_name}/#{action_name}").inspect)
            template_src = File.open(template_path).read
            template_src.gsub!(/attachments\/form/, 'shared/file_upload')
            render inline: template_src, layout: true
          end
          alias_method_chain action, :jquery_file_uploader
        end
      end
    end

    module InstanceMethods
    end

  end
end
