$(function () {
    "use strict";
    if ($("#attachments_fields").size()) {
        //Remove native controls to attach files and replace them to controls from JqeryFileUploader plugin
        $("#attachments_fields input:file").parent().remove();
        $("#attachments_fields").parent().find('.add_attachment').remove()
        $.ajax({
            url: "/jquery_files/new",
            success: function (form) { $("#attachments_fields").append(form); return false; }
        });
    }
});
