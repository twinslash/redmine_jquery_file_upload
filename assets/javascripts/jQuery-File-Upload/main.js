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
    var tempFolderName = randomKey(40), tempFilesCount = 0;

    $('div.container form').append('<input type="text" value="' + tempFolderName + '">');

    // Initialize the jQuery File Upload widget:
    $('#fileupload').fileupload({
        // Uncomment the following to send cross-domain cookies:
        // xhrFields: {withCredentials: true},
        url: '/jquery_files?tempFolderName=' + tempFolderName
        //autoUpload: true
    });


    $('#fileupload').bind('fileuploadadd', function (e, data) {
        $.each(data.files, function(index, file) {
            file.tempFileOrder = ++tempFilesCount;
        });
    });

    $('#fileupload').bind('fileuploadsubmit', function(e, data) {
        var old_url = $('#fileupload').fileupload('option', 'url');
        $('#fileupload').fileupload('option', { url: (function() {
                var regexp = /tempFileOrder=[^&]*/;
                var tempFileOrder = 'tempFileOrder=' + data.files[0].tempFileOrder;
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
