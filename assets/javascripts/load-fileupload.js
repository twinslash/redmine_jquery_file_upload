$(function () {
    "use strict";
    var attachmentsFields = $("#attachments_fields").parent();
    if (attachmentsFields) {
        // Remove native controls to attach files and replace them to controls from JqeryFileUploader plugin
        attachmentsFields.children("span").remove();
        $.ajax({
            url: "/jquery_files/new",
            success: function (form) { attachmentsFields.append(form); return false; }
        });
    }
});
