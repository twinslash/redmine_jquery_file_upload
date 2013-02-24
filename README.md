# Redmine jquery file upload plugin

Plugin for Redmine to more comfortable file upload.

* Maintainer: Dmitry Kovalenok, [Hirurg103](https://github.com/Hirurg103)
* Contact: Report questions, bugs or feature requests on the [IssueTracker](https://github.com/twinslash/redmine_jquery_file_upload/issues) or get in touch with me at [dzm.kov@gmail.com](mailto:dzm.kov@gmail.com)

## Installation

Clone plugin's source code into /plugins application directory
```console
git clone https://github.com/twinslash/redmine_jquery_file_upload.git
```
Restart server.

## Features

* Upload multiple files at once.
* Upload files by drag and drop from the desktop or file manager window.
* Upload image from clipboard by pressing Ctrl + V.
* File upload progress.
* Common process info.
![](http://farm9.staticflickr.com/8365/8502375713_b1e53ae0b1_c.jpg)
* Make cropping clipboard image and put it to uploads.
![](http://farm9.staticflickr.com/8521/8503481966_d542f08765_c.jpg)

## Uninstall

Remove /redmine_jquery_file_upload directory from /plugins directory
```console
cd redmine_application_path/plugins
rm -rf redmine_jquery_file_upload
```

Restart server.

## Dependencies

* This plugin successfully integrated with [clipboard_image_paste](https://github.com/peclik/clipboard_image_paste) plugin for Redmine. Thanks to [Richard Pecl](https://github.com/peclik) for the well commented code plugin.
* Used  [jQueryFileUpload](https://github.com/blueimp/jQuery-File-Upload) javascript plugin.
