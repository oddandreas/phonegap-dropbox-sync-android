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
dropbox.listFolder("/").done(function (files) {
    // call to listFolder successful
    // each object index in files have properties: path, modifiedTime, size, and isFolder
}).fail(function() {
    // call to listFolder method failed
});
```

Upload a file to Dropbox:
```
dropbox.uploadFile("file:///storage/sdcard0/DCIM/Camera/avideofile.mp4").done(function () {
    // call to uploadFile successful
    // you pass a local URI to this method
}).fail(function() {
    // call to uploadFile method failed
});
```

Upload a folder to Dropbox (grabs all subfolders & files):
```
dropbox.uploadFolder("file:///storage/sdcard0").done(function () {
    // call to uploadFolder successful
    // you pass a local URI to this method
}).fail(function() {
    // call to uploadFolder method failed
});
```

__Note: This plugin requires jQuery 1.5+ for the Deferred Object.__
