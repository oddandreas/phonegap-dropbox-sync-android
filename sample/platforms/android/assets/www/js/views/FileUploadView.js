var FileUploadView = function (template, listTemplate) {

    var _me = this;

    this.localFileFullPath = '';

    this.listTemplate = listTemplate;

    this.initialize = function () {
    
        this.el = $('<div/>');
         
         this.el.on('click', '#localFileList a[href="#localFile"]', function(event) {
            if (! $(this).hasClass('file')) {
                _me.localFileFullPath = $(this).attr('fullPath');
                _me.getFolderWithPath();
            }
            event.preventDefault();
         });
         
         this.el.on('taphold', '#localFileList a[href="#localFile"]', function(event) {
             var uploadPath = $(event.target).attr('fullPath'),
                 fileName = $(event.target).attr('fileName');
             if ($(this).hasClass('file')) {
                 window.confirm('Upload ' + fileName + ' to Dropbox?', 'Confirm File Upload', ['Yes', 'No'], function(buttonIndex) {
                     if (buttonIndex == 1) {
                         app.showLoader();
                         dropbox.uploadFile(uploadPath).done(function(result) {
                             app.hideLoader();
                         }).fail(function(err) {
                             console.log('dropbox.uploadFile fail, err -> ' + err);
                             app.hideLoader();
                         });
                     }
                 });
             } else {
                 window.confirm('Upload ' + fileName + ' folder to Dropbox?', 'Confirm Folder Upload', ['Yes', 'No'], function(buttonIndex) {
                     if (buttonIndex == 1) {
                         app.showLoader();
                         dropbox.uploadFolder(uploadPath).done(function(result) {
                             app.hideLoader();
                         }).fail(function(err) {
                             console.log('dropbox.uploadFolder fail, err -> ' + err);
                             app.hideLoader();
                         });
                     }
                 });
             }
             event.preventDefault();
         });
         
         this.el.on('click', '#btn-backToDropboxView', function(event) {
             app.showDropboxView();
             event.preventDefault();
         });
         
         this.el.on('click', '#btn-back', function(event) {
             if (_me.localFileFullPath == 'file:///') { // if we're at root
                 window.confirm('Go back to Dropbox list?', 'Show Dropbox', ['Yes', 'No'], function(buttonIndex) {
                     if (buttonIndex == 1) {
                         app.showDropboxView();
                     }
                 });
             } else {
                 _me.getParentFolder();
             }
             event.preventDefault();
         });
         
         $(window).off('orientationchange').on('orientationchange', function(event) {
             switch(window.orientation) {
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
         });
         
    }; // end initialize

    this.render = function() {
        this.el.html(template());
        return this;
    };
    
    this.getFSRoot = function(fileSystem) { // not really root on first run, but you can get to root if you're rooted by clicking back
        window.resolveLocalFileSystemURI("file:///storage", function(dir) {
            _me.localFileFullPath = dir.fullPath;
           var directoryReader = dir.createReader();
           directoryReader.readEntries(_me.readerSuccess,_me.readerFail);
        }, function(err){
           console.log('failed to get /storage directory, error ' + err.code + '\nfalling back to using fileSystem.root.fullPath');
           _me.localFileFullPath = fileSystem.root.fullPath;
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
        folderArray = [];
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
        $('#localFileList').html(html);
    } else {
        html = '<li class="topcoat-list__item" style="padding:5px;">No files found in this directory.</li>';
        $('#localFileList').html(html);
    }
    (this.localFileFullPath != '') ? $('#localPath').text(this.localFileFullPath) : $('#localPath').text('file:///storage');
};

FileUploadView.prototype.getFolderWithPath = function() {
    var _me = this;
    window.resolveLocalFileSystemURI(_me.localFileFullPath, function(dir) {
        var directoryReader = dir.createReader();
        directoryReader.readEntries(_me.readerSuccess,_me.readerFail);
    }, function(err){
        console.log("getDirectory error " + err.code);
    });
};

FileUploadView.prototype.getParentFolder = function() {
    var _me = this;
    if (_me.localFileFullPath != 'file:///storage/sdcard0' && _me.localFileFullPath != 'file:///storage/sdcard') {
        window.resolveLocalFileSystemURI(_me.localFileFullPath, function(dir) {
            dir.getParent(function(parent) {
                _me.localFileFullPath = parent.fullPath;
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
            _me.localFileFullPath = dir.fullPath;
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
// end local filesystem arithmetic **
