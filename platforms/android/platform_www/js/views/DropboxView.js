var DropboxView = function (template) {

    this.initialize = function () {
    	
    	if (! template) return; // making instance just for listFolder method
    	
    	var _me = this;
    	
        this.el = $('<div/>');

        this.el.on('click', '#btn-uploadFiles', function(event) {
            app.showFileUploadView();
            event.preventDefault();
         });
        
        this.el.on("click", '#btn-unlink', function(event) {
            app.showConfirm('Unlink from Dropbox?', 'Confirm Unlink', ['Yes', 'No'], function(buttonIndex) {
                if (buttonIndex == 1) {
                    app.showLoader();
                    dropbox.unlink().done(function() {
                        app.hideLoader();
                        app.showWelcomeView();
                    });
                }
            });
            event.preventDefault();
        });
        
        this.el.on("click", "#fileList .file", function(event) {
            var filePath = decodeURIComponent($(event.currentTarget).attr("href").substr(1));
            $("#filePath").html(filePath);
            app.showLoader();
            if( (/\.(gif|jpg|jpeg|tiff|png)$/i).test(filePath) ) {
                dropbox.readData(filePath).done(function(result) {
                    var bytes = new Uint8Array(result);
                    $('#image').attr('src', "data:image/jpeg;base64," + encode(bytes));
                    $("#image").show();
                    $("#text").hide();
                    app.hideLoader();
                });
            } else {
                dropbox.readString(filePath).done(function(result) {
                    $("#text").html(result);
                    $("#image").hide();
                    $("#text").show();
                    app.hideLoader();
                });
            }
            event.preventDefault();
        });
        
        this.el.on('click', '#btn-back', function(event) {
        	($('#path').text() == '/') ? app.showExitConfirm() : window.history.back();
        	event.preventDefault();
        });
        
        $(window).off('haschange').on('hashchange', function() {
            app.path = decodeURIComponent(window.location.hash.substr(1));
            $("#path").html(app.path ? app.path : '/');
            _me.listFolder();
        });
        
        $(window).off('orientationchange').on('orientationchange', function(event) {
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

        });
         
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
        folderArray = [];
    dropbox.listFolder(app.path).done(function (files) {
        l = files.length;
        (l > 0) ? $("#noFiles").hide() : $("#noFiles").show();
        for (i = 0; i < l; i++) {
            file = files[i];
            if (file.isFolder) {
                folderArray.push(file);
            } else {
                fileArray.push(file);
            }
        }
        folderArray.sortByKey('path');
        fileArray.sortByKey('path');
        var fileList = folderArray.concat(fileArray);
        for (i = 0; i < l; i++) {
            file = fileList[i];
            if (file.isFolder) {
                html += '<li fo="fo" class="topcoat-list__item">' +
                '<a href="#' + encodeURIComponent(file.path) + '" class="folder">' +
                '<img src="img/icon-folder.png" />' +
                file.path.substr(file.path.lastIndexOf("/") + 1)  + '</a></li>';
            } else {
                html += '<li fi="fi" class="topcoat-list__item">' +
                '<a href="#' + encodeURIComponent(file.path) + '" class="file">' +
                '<img src="img/icon-file.png" />' +
                file.path.substr(file.path.lastIndexOf("/") + 1)  + '</a></li>';
            }
        }
        $("#fileList").html(html);
    });
};