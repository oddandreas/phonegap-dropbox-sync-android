var FileUploadView = function (template, listTemplate) {

    var _me = this;
    
    this.isTapHolding = false;

    this.listTemplate = listTemplate;

    this.initialize = function () {

        this.el = $('<div/>');

        this.el.on('click', '#localFileList .folder', function(event) {
            if (_me.isTapHolding) {
                event.preventDefault();
                return;
            }
            app.localFileFullPath = $(this).attr('fullPath');
            _me.getFolderWithPath();
            event.preventDefault();
        });

        this.el.on('taphold', '#localFileList a[href="#localFile"]', function(event) {
            _me.isTapHolding = true;
            var fullPath = $(event.target).attr('fullPath'),
                fileName = $(event.target).attr('fileName');
            if ($(event.target).hasClass('file')) {
                window.confirm('Upload ' + fileName + ' to ' + app.dropboxPath + ' in Dropbox?',
                    'Confirm File Upload',
                    ['Yes', 'No'],
                    function (buttonIndex) {
                        _me.isTapHolding = false;
                        if (buttonIndex == 1) {
                            dropbox.uploadFile(fullPath, app.dropboxPath).done(function(result) {
                                // nothing to do, add here if needed
                            }).fail(function (err) {
                                console.log('dropbox.uploadFile fail, err -> ' + err);
                            });
                        }
                    }
                );
            } else {
                window.confirm('Upload ' + fileName + ' folder to ' + app.dropboxPath + ' in Dropbox?',
                    'Confirm Folder Upload',
                    ['Yes', 'Yes (Recursive)', 'No'],
                    function (buttonIndex) {
                        _me.isTapHolding = false;
                        if (buttonIndex == 1 || buttonIndex == 2) {
                            var doRecursive = (buttonIndex == 2) ? true : false;
                            dropbox.uploadFolder(fullPath, app.dropboxPath, doRecursive).done(function(result) {
                                // nothing to do, add here if needed
                            }).fail(function (err) {
                                console.log('dropbox.uploadFolder fail');
                            });
                        }
                    }
                );
            }
            event.preventDefault();
        });

        this.el.on('click', '#btn-backToDropboxView', function(event) {
            app.showDropboxView();
            event.preventDefault();
        });

        this.el.on('click', '#btn-back', function(event) {
            if (app.localFileFullPath == 'file:///') { // if we're at root
                window.confirm('Go back to Dropbox list?', 'Show Dropbox', ['Yes', 'No'], 
                    function(buttonIndex) {
                        if (buttonIndex == 1) {
                            app.showDropboxView();
                        }
                    }
                );
            } else {
                _me.getParentFolder();
            }
            event.preventDefault();
        });
        
        window.onhashchange = null; // the notification dialog buttons can trigger a hashchange event, destroy the event listener

        window.onorientationchange = null; // remove any current listeners
        window.onorientationchange = function(event) {
            switch (window.orientation) {
                case -90:
                case 90:
                    // landscape
                    app.loadIcon.css('left', '90px');
                    break;
                default:
                    //portrait
                    app.loadIcon.css('left', '70px');
                    break;
            }
        };
         
    }; // end initialize

    this.render = function() {
        this.el.html(template());
        return this;
    };
    
    this.getFSRoot = function(fileSystem) { // not really root on first run, but you can get to root if you're rooted by clicking back
        window.resolveLocalFileSystemURI("file:///storage", function(dir) {
           app.localFileFullPath = dir.fullPath;
           var directoryReader = dir.createReader();
           directoryReader.readEntries(_me.readerSuccess,_me.readerFail);
        }, function(err){
           console.log('failed to get /storage directory, error ' + err.code + '\nfalling back to using fileSystem.root.fullPath');
           app.localFileFullPath = fileSystem.root.fullPath;
           var directoryReader = fileSystem.root.createReader();
           directoryReader.readEntries(_me.readerSuccess,_me.readerFail);
        });
    };
    
    this.readerSuccess = function(entries) {
        _me.appendToLocalFileList(entries);
    };

    this.initialize();

}; // end FileUploadView

FileUploadView.prototype.appendToLocalFileList = function(entries) {
    var fileCount = entries.length,
        html = '',
        file,
        fileArray = [],
        folderArray = [],
        _me = this;
    if (fileCount > 0) {
        for (var i = 0; i < fileCount; i++) {
            file = entries[i];
            if (file.isDirectory) {
                folderArray.push(file);
            } else {
                fileArray.push(file);
            }
        }
        folderArray.sortByKey('name');
        fileArray.sortByKey('name');
        var fileList = folderArray.concat(fileArray);
        html = this.listTemplate(fileList);
    } else {
        html = this.listTemplate();
    }
    $('#localPath').text( (app.localFileFullPath != '') ? app.localFileFullPath : 'file:///storage' );
    $('#localFileList').html(html);
    if (app.fileUploadViewIScroll) {
        app.fileUploadViewIScroll.destroy();
    }
    setTimeout(function() {
        app.fileUploadViewIScroll = new IScroll($('#localFileListScroller', _me.el)[0], {
            scrollbars: true,
            fadeScrollbars: true,
            shrinkScrollbars: 'clip',
            click: true
        });
        app.fileUploadViewIScroll.on('scrollEnd', _me.handleIScroll);
        var checkIndex = app.fileUploadViewScrollCache.contains('path', app.localFileFullPath);
        if (checkIndex != -1) {
            app.fileUploadViewIScroll.scrollTo(0, app.fileUploadViewScrollCache[checkIndex].pos);
        }
    }, 10);
};

FileUploadView.prototype.handleIScroll = function() {
    var checkIndex = app.fileUploadViewScrollCache.contains('path', app.localFileFullPath);
    if (checkIndex == -1) {
        app.fileUploadViewScrollCache.push({
            path: app.localFileFullPath,
            pos: this.y
        });
    } else {
        app.fileUploadViewScrollCache[checkIndex].pos = this.y;
    }
};

FileUploadView.prototype.getFolderWithPath = function() {
    var _me = this;
    window.resolveLocalFileSystemURI(app.localFileFullPath, function(dir) {
        var directoryReader = dir.createReader();
        directoryReader.readEntries(_me.readerSuccess,_me.readerFail);
    }, function(err){
        console.log("getDirectory error " + err.code);
    });
};

FileUploadView.prototype.getParentFolder = function() {
    var _me = this;
    if (app.localFileFullPath != 'file:///storage/sdcard0' && app.localFileFullPath != 'file:///storage/sdcard') {
        window.resolveLocalFileSystemURI(app.localFileFullPath, function(dir) {
            dir.getParent(function(parent) {
                app.localFileFullPath = parent.fullPath;
                var directoryReader = parent.createReader(); // this gives the wrong path when at file:///storage/sdcard
                directoryReader.readEntries(_me.readerSuccess,_me.readerFail);
            }, function(err){
                console.log("getParent error " + err.code);
            });
        }, function(err){
            console.log("getDirectory error " + err.code);
        });
    } else {
        window.resolveLocalFileSystemURI('file:///storage', function(dir) {
            app.localFileFullPath = dir.fullPath;
            var directoryReader = dir.createReader();
            directoryReader.readEntries(_me.readerSuccess,_me.readerFail);
        }, function(err){
            console.log("error getting storage directory, error " + err.code);
        });
    }
};

FileUploadView.prototype.FSfail = function(err) {
    console.log("FSfail and error is below");
    console.log(err);
};
        
FileUploadView.prototype.readerFail = function(error) {
    alert("Failed to list directory contents: " + error.code);
};
