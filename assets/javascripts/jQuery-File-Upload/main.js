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

    // tempFolderName value used to find folder from which load files after submit
    var tempFolderName = randomKey(40), tempFilesCount = 0;
    $('div.#content form').append('<input type="text" value="' + tempFolderName + '" name="tempFolderName" style="display:none">');

    // this flag indicates if the form was submitted before unload
    var isFormSubmitted = false;
    $('form').bind('submit', function () { isFormSubmitted = true; })

    // remove temp folder if the form was not submitted
    window.onbeforeunload = function () {
        if(!isFormSubmitted) {
            $.ajax({
                url: '/jquery_files/' + tempFolderName + '/destroy_tempfolder',
                type: 'DELETE'
            })
        }
    }

    // this hook makes possible to hide input[type="file"] under link
    var uploadButtonWidth = $('#upload_button').width(), uploadButtonHeight = $('#upload_button').height();
    $('#upload_input').width(uploadButtonWidth + 10).height(uploadButtonHeight + 2).css('left', -(uploadButtonWidth + 5)).css('top', -1);

    // countUploads holds number of files that added but not yet uploaded;
    // countUploaded stores number of actually uploaded files without deleted
    var countUploads = 0, countUploaded = 0;

    //this function used instead _renderDownload function jQueryFileUpploadPlugin
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
        //this function replace native jQueryFileUpload done function to prevent render downloadTemplate
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
        //this function replace native jQueryFileUpload fail function to prevent render downloadTemplate
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
        $.each(data.files, function(index, file) {
            file.tempFileOrder = ++tempFilesCount;
        });
    });

    $('#attachments_fields').bind('fileuploadcompleted', function (e, data) {
       $.each(data.files, function(index, file) {
            countUploaded++;
            countUploads--;
        });
       if(!countUploads) {  data.form.find('input:submit').removeAttr('disabled'); }
       data.form.find('table thead tr').addClass('in');
    });

    $('#attachments_fields').bind('fileuploaddestroyed', function (e, data) {
            countUploaded--;
            if(!countUploaded) { $(e.currentTarget).parents('form').find('table thead tr').removeClass('in'); }
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
        data.form.find('input:submit').attr('disabled', 'disabled');
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
    $('#fileupload').fileupload(
        'option',
        'redirect',
        window.location.href.replace(
            /\/[^\/]*$/,
            ''
        )
    );

    $('#fileupload').fileupload('option', {
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
                .appendTo('#fileupload');
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
