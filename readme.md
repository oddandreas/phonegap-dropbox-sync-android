# PhoneGap Plugin for the Dropbox Sync API (Android Version) #

A PhoneGap plugin for the [Dropbox Sync API](https://www.dropbox.com/developers/sync).

Read my blog post [here](http://rossmartindev.blogspot.com/2013/08/phonegap-plugin-for-dropbox-sync-api.html)

Sample Usage
-----------
Link to Dropbox:

```
dropbox.link();
```

List a Dropbox folder:
```
var dropboxFolderPath = "/"; // root app dir in this case

dropbox.listFolder(dropboxFolderPath).done(function(files) {
    // each object in files have properties: path, modifiedTime, size, and isFolder.
});
```

Upload a file to Dropbox:
```
dropbox.uploadFile({
    filePath: "file:///storage/sdcard0/DCIM/Camera/SomeVideo.mp4", // required, local URI
    dropboxPath: "/someFolder" // optional, defaults to root ('/')
}).done(function() {
    // dropboxPath is the Dropbox folder you want to upload the file into.
});
```

Upload a folder to Dropbox:
```
dropbox.uploadFolder({
    folderPath: "file:///storage/sdcard0", // required
    dropboxPath: "/someFolder", // optional, defaults to root ('/')
    doRecursive: true // optional, defaults to false
}).done(function() {
    // dropboxFolderPath is the Dropbox folder you want to upload the files/folders into.
    // The folder upload can be done recursively by setting doRecursive to true.
});
```

Open a Dropbox file:
```
var filePath = "/foo/bar.jpg";

dropbox.openFile(filePath).done(function() {
    // Android device will either open the file with the proper external application
    // installed on your device or ask you which application to use.
});
```

Create a new folder in Dropbox:
```
var folderPath = "/foo/bar";

dropbox.createFolder(folderPath).done(function() {
    // Creates a new folder, including parent folders if necessary.
});
```

Delete a file/folder in Dropbox:
```
var filePath = "/foo/bar.json";

dropbox.deleteFile(filePath).done(function() {
    // Deletes a file, or recursively deletes a folder.
});
```

Read a file in Dropbox:
```
var filePath = "/foo/bar.json";

dropbox.readString(filePath).done(function(result) {
    // Reads the contents of a file (result is a string).
});
```

Get the Base64 decoded string from an image in Dropbox
(use an image from Dropbox in your app):
```
var filePath = "foobar.jpg";

dropbox.getImageBase64String(filePath).done(function(result) {
    $('#image').attr('src', "data:image/jpeg;base64," + result);
    // result is the Base64-encoded string.
});
```

Unlink from Dropbox:

```
dropbox.unlink().done(function() {
    // do something here after deferred resolved
});
```

__Note: This plugin requires jQuery 1.5+ for the Deferred Object.__

Updates
-----------
***```3-8-14```***<br>**- Removed use of the "getImageBase64String" & "readString" methods in the sample app.  Now Android device will either open the file with proper external application installed on your device or ask you which application to use.**<br>

***```3-4-14```***<br>**- Added ability to delete files/folders and create new folders in the Dropbox plugin.**<br>
**- Updated sample app UI with Topcoat Effeckts.  Added Topcoat overlay and off screen nav menu with Effeckt CSS that uses webkit animations and transforms.**<br>
**- Added a fix to the viewport in the sample app for Android 4.4 and higher.**

***```2-24-14```***<br>**- Updated sample app to PhoneGap 3.4.0 and added pull to refresh feature on Dropbox list.**

***```2-15-14```***<br>**- Added iScroll 5 and a scroll caching feature to the sample app.**
 
 ***```1-14-14```***<br>**- The sample app is now using handlebars.js, fastclick.js, and pageslider.js**<br>
**- Only 1 view is in the DOM at a time now, this improved performance a lot**<br>
**- The sample app requires API 19 (Android 4.4.2) SDK to build and run.  This is a result of upgrading to PhoneGap 3.3.1**
