# PhoneGap Plugin for the Dropbox Sync API (Android Version) #

A PhoneGap plugin for the [Dropbox Sync API](https://www.dropbox.com/developers/sync).

Read my blog post [here](http://rossmartindev.blogspot.com/2013/08/phonegap-plugin-for-dropbox-sync-api.html)

Sample Usage:
-----------
Link to Dropbox:

```
dropbox.link();
```

List the Dropbox App's root folder:
```
dropbox.listFolder("/").done(function(files) {
    // each object index in files have properties: path, modifiedTime, size, and isFolder
});
```

Upload a file to Dropbox:
```
var localFileUri = "file:///storage/sdcard0/DCIM/Camera/SomeVideo.mp4";
var dropboxFolderPath = "/someFolder";

dropbox.uploadFile(localFileUri, dropboxFolderPath).done(function() {
    // dropboxFolderPath is the Dropbox folder you want to upload the file into
});
```

Upload a folder to Dropbox:
```
var localFileUri = "file:///storage/sdcard0";
var dropboxFolderPath = "/someFolder";
var doRecursive = true;

dropbox.uploadFolder(localFileUri, dropboxFolderPath, doRecursive).done(function() {
    // dropboxFolderPath is the Dropbox folder you want to upload the files/folders into
    // you can upload all subfolders & files within the given local file URI by passing true in the 3rd parameter
});
```

__Note: This plugin requires jQuery 1.5+ for the Deferred Object.__
 
 
 ***```Update 1-14-14```***<br>**- The sample app is now using handlebars.js, fastclick.js, and pageslider.js**<br>
**- Only 1 view is in the DOM at a time now, this improved performance a lot**<br>
**- The sample app requires API 19 (Android 4.4.2) SDK to build and run.  This is a result of upgrading to PhoneGap 3.3.1**

***```Update 2-15-14```***<br>**- Added iScroll 5 and a scroll caching feature to the sample app.**
