# PhoneGap Plugin for the Dropbox Sync API (Android Version) #

A PhoneGap plugin for the [Dropbox Sync API](https://www.dropbox.com/developers/sync).


Usage:
-----------
Link to Dropbox:

```
dropbox.link.done(function() {
    // call to link method successful
}).fail(function() {
    // call to link method failed
});
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
dropbox.uploadFolder("file:///storage/sdcard0/DCIM").done(function () {
    // call to uploadFolder successful
    // you pass a local URI to this method
}).fail(function() {
    // call to uploadFolder method failed
});
```

Upload a folder to Dropbox (grabs all subfolders & files):
```
dropbox.uploadFile("file:///storage/sdcard0").done(function () {
    // call to uploadFile successful
    // you pass a local URI to this method
}).fail(function() {
    // call to uploadFile method failed
});
```
