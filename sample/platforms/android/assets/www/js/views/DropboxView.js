var DropboxView = function (template, listTemplate) {

    this.initialize = function () {

        this.listTemplate = listTemplate;
        
        if (! template) return; // making instance just for listFolder method
        
        var _me = this;
        
        this.el = $('<div/>');

        this.el.on('click', '#btn-uploadFiles', function(event) {
            app.showFileUploadView();
            event.preventDefault();
         });
        
        this.el.on("click", '#btn-unlink', function(event) {
            window.confirm('Unlink from Dropbox?', 'Confirm Unlink', ['Yes', 'No'], 
            function(buttonIndex) {
                if (buttonIndex == 2) return;
                app.showLoader();
                dropbox.unlink().done(function() {
                    app.hideLoader();
                    app.showWelcomeView();
                });
            });
            event.preventDefault();
        });
        
        this.el.on('click', '#fileList .file', function(event) {
            var filePath = decodeURIComponent($(event.currentTarget).attr('href').substr(1));
            $('#filePath').html(filePath);
            app.showLoader();
            if( (/\.(gif|jpg|jpeg|tiff|png)$/i).test(filePath) ) {
                $('#text, #image').hide();
                dropbox.readData(filePath).done(function(result) {
                    var bytes = new Uint8Array(result);
                    $('#image').attr('src', "data:image/jpeg;base64," + encode(bytes)).show();
                    app.hideLoader();
                });
            } else {
                $('#image, #text').hide();
                dropbox.readString(filePath).done(function(result) {
                    $('#text').html(result).show();
                    app.hideLoader();
                });
            }
            event.preventDefault();
        });
        
        this.el.on('click', '#btn-back', function(event) {
            (app.dropboxPath == '/') ? app.showExitConfirm() : window.history.back();
            event.preventDefault();
        });
        
        window.onhashchange = function() {
            app.dropboxPath = decodeURIComponent(window.location.hash.substr(1));
            if (app.dropboxPath == '') {
                app.dropboxPath = '/';
            }
            $('#path').html(app.dropboxPath);
            _me.listFolder();
        };
        
        window.onorientationchange = null; // remove any current listeners
        window.onorientationchange = function(event) {
            setTimeout(function() {
                var h = $('#content').height(),
                    w = $('#content').width();
                $('#image').css({'max-width':w, 'max-height':h});
                $('#text').css('max-width', w);
            }, 300);

            switch(window.orientation) {
                case -90:
                case 90:
                    // landscape
                    app.loadIcon.css('left', '90px');
                    break;
                default:
                    //portrait
                    app.loadIcon.css('left', '60px');
                    break; 
            }
        };
         
    }; // end initialize

    this.render = function() {
        this.el.html(template());
        return this;
    };

    this.initialize();

};

DropboxView.prototype.listFolder = function() {
    var i,
        l,
        html = "",
        file,
        fileArray = [],
        folderArray = [],
        _me = this;
    dropbox.listFolder(app.dropboxPath).done(function(files) {
        l = files.length;
        (l > 0) ? $("#noFiles").hide() : $("#noFiles").show();
        for (i = 0; i < l; i++) {
            file = files[i];
            file.fileName = files[i].path.substr(file.path.lastIndexOf("/") + 1);
            file.encodedPath = encodeURIComponent(files[i].path);
            if (file.isFolder) {
                folderArray.push(file);
            } else {
                fileArray.push(file);
            }
        }
        folderArray.sortByKey('path');
        fileArray.sortByKey('path');
        var fileList = folderArray.concat(fileArray);
        html = _me.listTemplate(fileList);
        $("#fileList").html(html);
        $('#path').html(app.dropboxPath);
    });
};
