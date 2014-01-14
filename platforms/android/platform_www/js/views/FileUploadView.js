var FileUploadView = function (template) {

	var _me = this;
	
	this.localFileFullPath = '';
	
    this.initialize = function () {
    	
        this.el = $('<div/>');
         
         this.el.on('click', '#localFileList a[href="#localFile"]', function(event) {
            if (! $(this).hasClass('file')) {
            	_me.localFileFullPath = $(this).attr('fullPath');
                _me.getFolderWithPath();
            }
            event.preventDefault();
         }).on('taphold', 'a[href="#localFile"]', function(event) {
             var uploadPath = $(this).attr('fullPath'),
                 fileName = $(this).attr('fileName');
             if ($(this).hasClass('file')) {
                 app.showConfirm('Upload ' + fileName + ' to Dropbox?', 'Confirm File Upload', ['Yes', 'No'], function(buttonIndex) {
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
                 app.showConfirm('Upload ' + fileName + ' folder to Dropbox?', 'Confirm Folder Upload', ['Yes', 'No'], function(buttonIndex) {
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
                 app.showConfirm('Go back to Dropbox list?', 'Show Dropbox', ['Yes', 'No'], function(buttonIndex) {
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
             setTimeout(function() {
                 var h = $('#content').height(),
                 	 w = $('#content').width();
                 $('#image').css({'max-width':w, 'max-height':h});
             }, 300);

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
        for (var i = 0; i < fileCount; i++) {
        	file = fileList[i];
            if (file.isDirectory) {
                html += '<li fo="fo" class="topcoat-list__item">' + '<a href="#localFile" class="folder" ' +
                'fullPath="'+ file.fullPath +'" fileName="'+ file.name +'">' +
                '<img src="img/icon-folder.png" />' +
                file.name + '</a></li>';
            } else {
                html += '<li fi="fi" class="topcoat-list__item">' + '<a href="#localFile" class="file" ' +
                'fullPath="'+ file.fullPath +'" fileName="'+ file.name +'">' +
                '<img src="img/icon-file.png" />' +
                file.name + '</a></li>';
            }
        }
        $('#localFileList').html(html);
    } else {
        html = '<li class="topcoat-list__item" style="padding:5px;">No files found in this directory.</li>';
        $('#localFileList').html(html);
    }
    (this.localFileFullPath != '') ? $('#localPath').text(this.localFileFullPath) : $('#localPath').text('file:///storage');
};

// ** local filesystem arithmetic
/*FileUploadView.prototype.getFSRoot = function(fileSystem) { // not really root on first run, but you can get to root if you're rooted by clicking back
	var _me = this;
    window.resolveLocalFileSystemURI("file:///storage", function(dir) {
    	console.log('got file:///storage');
    	_me.localFileFullPath = dir.fullPath;
       var directoryReader = dir.createReader();
       directoryReader.readEntries(_me.readerSuccess,_me.readerFail);
    }, function(err){
       console.log('failed to get /storage directory, error ' + err.code + '\nfalling back to using fileSystem.root.fullPath');
       _me.localFileFullPath = fileSystem.root.fullPath;
       var directoryReader = fileSystem.root.createReader();
       directoryReader.readEntries(_me.readerSuccess,_me.readerFail);
    });
}*/

FileUploadView.prototype.getFolderWithPath = function() {
	console.log('FileUploadView.getFolderWithPath()');
	var _me = this;
    window.resolveLocalFileSystemURI(_me.localFileFullPath, function(dir) {
        var directoryReader = dir.createReader();
        directoryReader.readEntries(_me.readerSuccess,_me.readerFail);
    }, function(err){
        console.log("getDirectory error " + err.code);
    });
}

FileUploadView.prototype.getParentFolder = function() {
	console.log('FileUploadView.getParentFolder()');
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
}

/*FileUploadView.prototype.readerSuccess = function(entries) {
	console.log('FileUploadView.readerSuccess()');
    this.appendToLocalFileList(entries);
}*/

FileUploadView.prototype.FSfail = function(err) {
console.log("FSfail and error is below");
console.log(err);
}
        
FileUploadView.prototype.readerFail = function(error) {
    alert("Failed to list directory contents: " + error.code);
}
// end local filesystem arithmetic **