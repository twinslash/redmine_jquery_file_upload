/*
 * jQuery File Upload Plugin JS Example 7.0
 * https://github.com/blueimp/jQuery-File-Upload
 *
 * Copyright 2010, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

/*jslint nomen: true, unparam: true, regexp: true */
/*global $, window, document */

$(function () {
    'use strict';

    // function to truncate large strings
    String.prototype.truncate = function(length, truncateString) {
        length || (length = 30);
        truncateString || (truncateString = "...");
        var l = length - truncateString.length;
        return this.length > length ? this.substring(0, l).concat(truncateString) : this;
    }

    // this prevents deletion session after ajax requests
    $(document).ajaxSend(function(e, xhr, options) {
        var token = $("meta[name='csrf-token']").attr("content");
        xhr.setRequestHeader("X-CSRF-Token", token);
    });


    // tempFolderName value used to find folder from which load files after submit
    var tempFolderName = randomKey(40), tempFilesCount = 0;
    $('div.#content form').append('<input type="text" value="' + tempFolderName + '" name="tempFolderName" style="display:none">');

    // this flag indicates if the form was submitted before unload
    var isFormSubmitted = false;
    $('form').bind('submit', function () { isFormSubmitted = true; })

    // remove temp folder if the form was not submitted
    $(window).unload(function () {
        if(!isFormSubmitted) {
            $.ajax({
                url: '/jquery_files/' + tempFolderName + '/destroy_tempfolder',
                type: 'DELETE',
                async: false
            });
        }
    });

   // this function makes file input the same size as link "select files from your computer..."
    function resizeFileInput() {
        var uploadButtonWidth = $('#upload_button').width(), uploadButtonHeight = $('#upload_button').height();
        $('#upload_input').width(uploadButtonWidth + 10).height(uploadButtonHeight + 2).css('left', -(uploadButtonWidth + 5)).css('top', -1);
    };

    // set approprate size to input[type="file"]
    resizeFileInput();
    // if form hidden we need make call to resizeFileInput after form shown to set approprate size to input[type="file"]
    var $fn_show = $.fn.show;
    $.fn.show = function(a, b, c) { var return_value = $fn_show.apply(this, a, b, c); this.each(function() { $(this).trigger('afterShow') }); return return_value; }
    $('#main').bind('afterShow', resizeFileInput);

    // countUploads holds number of files that added but not yet uploaded;
    // countUploaded stores number of actually uploaded files without deleted
    // countFromClipboard stores count of files, added from clipboard
    var countUploads = 0, countUploaded = 0, countFromClipboard = 0;

    // this function used instead _renderDownload function jQueryFileUpploadPlugin
    function renderDownload(node, file) {
        var subnode;
        node.attr('class', 'template-download fade');
        if (file.error) {
            (subnode = node.find('.error-upload')).length || (subnode = node.find('.start')).length || (subnode = node.find('.empty')).length;
            subnode.attr('class', 'error-upload').append($('<span>').text('Error: ' + file.error));
        } else {
            if (file.thumbnail_url) {
                node.find('.preview').append($('<a href="' + file.url + '" title="' + file.name + '" download="' + file.name + '" data-gallery="gallery"').append('<img src="' + file.thumbnail.url + '">'));
            }
            node.find('.name').append($('<a href="' + file.url + '" title="' + file.name + '" download="' + file.name + '" data-gallery="' + file.thumbnail_url && 'gallery' + '"').text(file.name.truncate()));
            (subnode = node.find('.error-upload')).length || (subnode = node.find('.start')).length || (subnode = node.find('.empty')).length;
            subnode.attr('class', 'empty');
        }
        node.find('.cancel .icon-discard').attr('class', 'icon icon-del');
        node.find('.cancel').append('<input type="checkbox" name="delete" value="1">');
        subnode = node.find('.cancel button').attr('data-type', file.delete_type).attr('data-url', file.delete_url);
        if (file.delete_with_credentials) {
            subnode.attr('data-xhr-fields', '{"withCredentials":true}');
        }
        node.find('.cancel').attr('class', 'delete');
        node.find('.meter').hide();
        return node;
    }

    // Initialize the jQuery File Upload widget:
    $('#attachments_fields').fileupload({
        // Uncomment the following to send cross-domain cookies:
        // xhrFields: {withCredentials: true},
        url: '/jquery_files?tempFolderName=' + tempFolderName,
        type: 'POST',
        autoUpload: true,
        xhrFields: {
            withCredentials: true
        },

        // this function replace native jQueryFileUpload add function to prevent paste from clipboard when paste dialog from ClipboardImagePaste plugin is opened
        add: function (e, data) {
            // ignore paste event if paste from clipboard dialog opened
            if (e.originalEvent && e.originalEvent.type == "paste" && window.cbpDialogOpened) return;
            var that = $(this).data('fileupload'),
                options = that.options,
                files = data.files;
            $(this).fileupload('process', data).done(function () {
                that._adjustMaxNumberOfFiles(-files.length);
                data.isAdjusted = true;
                data.files.valid = data.isValidated = that._validate(files);
                data.context = that._renderUpload(files).data('data', data);
                options.filesContainer[
                    options.prependFiles ? 'prepend' : 'append'
                ](data.context);
                that._renderPreviews(files, data.context);
                that._forceReflow(data.context);
                that._transition(data.context).done(
                    function () {
                        if ((that._trigger('added', e, data) !== false) &&
                                (options.autoUpload || data.autoUpload) &&
                                data.autoUpload !== false && data.isValidated) {
                            data.submit();
                        }
                    }
                );
            });
        },

        // this function replace native jQueryFileUpload done function to prevent render downloadTemplate
        done: function (e, data) {
            var that = $(this).data('fileupload'),
                template,
                preview;
            if (data.context) {
                data.context.each(function (index) {
                    var file = ($.isArray(data.result) &&
                            data.result[index]) || {error: 'emptyResult'};
                    if (file.error) {
                        that._adjustMaxNumberOfFiles(1);
                    }
                    that._transition($(this)).done(
                        function () {
                            var node = $(this);
                            template = renderDownload(node, file);
                            that._forceReflow(template);
                            that._transition(template).done(
                                function () {
                                    data.context = $(this);
                                    that._trigger('completed', e, data);
                                }
                            );
                        }
                    );
                });
            } else {
                template = that._renderDownload(data.result)
                    .appendTo(that.options.filesContainer);
                that._forceReflow(template);
                that._transition(template).done(
                    function () {
                        data.context = $(this);
                        that._trigger('completed', e, data);
                    }
                );
            }
        },

        // this function replace native jQueryFileUpload fail function to prevent render downloadTemplate
        fail: function (e, data) {
            var that = $(this).data('fileupload'),
                template;
            that._adjustMaxNumberOfFiles(data.files.length);
            if (data.context) {
                data.context.each(function (index) {
                    if (data.errorThrown !== 'abort') {
                        var file = data.files[index];
                        file.error = file.error || data.errorThrown ||
                            true;
                        that._transition($(this)).done(
                            function () {
                                var node = $(this);
                                template = renderDownload(node, file);
                                that._forceReflow(template);
                                that._transition(template).done(
                                    function () {
                                        data.context = $(this);
                                        that._trigger('failed', e, data);
                                    }
                                );
                            }
                        );
                    } else {
                        that._transition($(this)).done(
                            function () {
                                $(this).remove();
                                that._trigger('failed', e, data);
                            }
                        );
                    }
                });
            } else if (data.errorThrown !== 'abort') {
                that._adjustMaxNumberOfFiles(-data.files.length);
                data.context = that._renderUpload(data.files)
                    .appendTo(that.options.filesContainer)
                    .data('data', data);
                that._forceReflow(data.context);
                that._transition(data.context).done(
                    function () {
                        data.context = $(this);
                        that._trigger('failed', e, data);
                    }
                );
            } else {
                that._trigger('failed', e, data);
            }
        }
    });

    $('#attachments_fields').bind('fileuploadadd', function (e, data) {
        var fromClipboard;
        // ignore paste event if paste from clipboard dialog opened
        if (e.originalEvent && e.originalEvent.type == "paste" && window.cbpDialogOpened) return;
        // mark all files from clipboard
        if (e.originalEvent && e.originalEvent.type == "paste") { fromClipboard = true; }
        $.each(data.files, function(index, file) {
            file.tempFileOrder = ++tempFilesCount;
            if (fromClipboard || file.fromClipboard) {
                countFromClipboard++;
                file.fromClipboard = true;
                // generate "unique" identifier, using "random" part cbImagePaste.cbp_act_update_id
                var attachId    = cbImagePaste.cbp_act_update_id + "-" + countFromClipboard;
                file.uniqueName = "screenshot" + attachId + ".png";
                file.onInputNameBlur = function() {
                    this.value = this.value.replace(/^\s+|\s+$/g, '');
                    if (this.value == '')
                        this.value = this.defaultValue;
                    else if (this.value.search(/\.png$/) < 1)
                        this.value += ".png";
                    this.value = this.value.replace(/[\/\\!%\?\*:'"\|<>&]/g, "-");
                    this.value = this.value.replace(/ /g, "_");
                }

                //----------------------------------------------------------------------------
                // Show copy wiki link dialog.
                file.onButtonLinkClick = function (el) {
                    var name = $(this).prev().val();
                    $("#cbp_image_link").val("!" + name + "!");
                    $("#cbp_thumbnail_link").val("{{thumbnail(" + name + ")}}");

                    $("#cbp_link_dlg").dialog({
                        closeOnEscape: true,
                        modal: true,
                        resizable: false,
                        dialogClass: "cbp_drop_shadow cbp_dlg_small",
                        position: { my: "left top", at: "left bottom", of: $(this) },
                        minHeight: 0,
                        width: "auto"
                    });
                    return false;
                }
            }
        });
    });

    $('#attachments_fields').bind('fileuploadcompleted', function (e, data) {
       $.each(data.files, function(index, file) {
            countUploaded++;
            countUploads--;
        });
       if(!countUploads) {  data.form.find('input:submit').removeAttr('disabled'); }
       data.form.find('table thead tr td#check_and_delete_all').addClass('in');
    });

    $('#attachments_fields').bind('fileuploaddestroyed', function (e, data) {
            countUploaded--;
            if(!countUploaded) { $(e.currentTarget).parents('form').find('table thead tr td#check_and_delete_all').removeClass('in'); }
    });

    $('#attachments_fields').bind('fileuploadfailed', function (e, data) {
           $.each(data.files, function(index, file) {
              countUploads--;
           });
           if(!countUploads) {  data.form.find('input:submit').removeAttr('disabled'); }
    });

    $('#attachments_fields').bind('fileuploadsubmit', function(e, data) {
        var old_url = $('#attachments_fields').fileupload('option', 'url');
        countUploads++;
        $('#attachments_fields').parents('form').find('input:submit').attr('disabled', 'disabled');
        $('#attachments_fields').fileupload('option', { url: (function() {
                var regexp = /(tempFileOrder\[\]=[\d]*&)*tempFileOrder\[\]=[\d]*/;
                var tempFileOrder = data.files.map(function (file) { return 'tempFileOrder[]=' + file.tempFileOrder; }).join('&');
                if( old_url.match(regexp) ) {
                    return old_url.replace(regexp, tempFileOrder);
                } else {
                    return old_url + '&' + tempFileOrder;
                }
            })()
        });
        return true;
    });

    // Enable iframe cross-domain access via redirect option:
    $('#attachments_fields').fileupload(
        'option',
        'redirect',
        window.location.href.replace(
            /\/[^\/]*$/,
            ''
        )
    );

    $('#attachments_fields').fileupload('option', {
        // url: '//jquery-file-upload.appspot.com/',
        // maxFileSize: 5000000,
        // acceptFileTypes: /(\.|\/)(gif|jpe?g|png)$/i,
        process: [
            // {
            //     action: 'load',
            //     fileTypes: /^image\/(gif|jpeg|png)$/,
            //     maxFileSize: 20000000 // 20MB
            // },
            {
                action: 'resize',
                maxWidth: 1440,
                maxHeight: 900
            },
            {
                action: 'save'
            }
        ]
    });

    // Upload server status check for browsers with CORS support:
    if ($.support.cors) {
        $.ajax({
            url: '/jquery_files',
            type: 'HEAD'
        }).fail(function () {
            $('<span class="alert alert-error"/>')
                .text('Upload server currently unavailable - ' +
                        new Date())
                .appendTo('#attachments_fields');
        });
    }

    // Load existing files:
    // $.ajax({
    //     // Uncomment the following to send cross-domain cookies:
    //     //xhrFields: {withCredentials: true},
    //     url: '/jquery_files',
    //     dataType: 'json',
    //     context: $('#fileupload')[0]
    // }).done(function (result) {
    //     $(this).fileupload('option', 'done')
    //         .call(this, null, {result: result});
    // });
});
