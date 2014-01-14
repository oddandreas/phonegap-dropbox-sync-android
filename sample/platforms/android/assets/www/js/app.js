var app = (function() {

	var loadIcon = $('#loader'),
        welcomeViewTpl = Handlebars.compile($('#welcomeView-tpl').html()),
        dropboxViewTpl = Handlebars.compile($('#dropboxView-tpl').html()),
        fileListTpl = Handlebars.compile($('#fileList-tpl').html()),
        fileUploadViewTpl = Handlebars.compile($('#fileUploadView-tpl').html()),
        localFileListTpl = Handlebars.compile($('#localFileList-tpl').html()),
        slider = new PageSlider($('body'));
    
    var showWelcomeView = function() {
		var welcomeView = new WelcomeView(welcomeViewTpl);
		slider.slidePageFrom(welcomeView.render().el, 'left');
    };

    var showDropboxView = function() {
		var dropboxView = new DropboxView(dropboxViewTpl, fileListTpl);
		slider.slidePageFrom(dropboxView.render().el, ($('#fileUploadView').length > 0) ? 'left' : 'right');
    	
        var h = $('#content').height(),
    		w = $('#content').width();
        
    	$('#image').css({'max-width': w, 'max-height': h});
    	$('#text').css('max-width', w);
        loadIcon.css('left', '60px');
        
        app.path = (app.path) ? app.path : '/';
        dropboxView.listFolder();
        dropbox.addObserver("/");
    };
    
    var showFileUploadView = function() {
		var fileUploadView = new FileUploadView(fileUploadViewTpl, localFileListTpl);
		slider.slidePageFrom(fileUploadView.render().el, 'right');
        
        loadIcon.css('left', '70px');
        
        if (fileUploadView.localFileFullPath == '') {
            // request the persistent file system
            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, fileUploadView.getFSRoot, fileUploadView.FSfail);
        } else {
        	fileUploadView.getFolderWithPath();
        }
    };
    
    document.addEventListener("deviceReady", function() {   // ready for kickoff
        if (navigator.notification) { // Override default HTML alert with native dialog
            window.confirm = function (message, title, labels, success) {
                navigator.notification.confirm(
	                message, // message string
	                success, // callback to invoke with index of button pressed
	                title,   // title string
	                labels   // buttonLabels array
                );
            };
        }
    	
        dropbox.checkLink().done(showDropboxView).fail(showWelcomeView);
        
        // hook btn-back to the device's back button
        document.addEventListener('backbutton', onBackKeyDown, false);
        function onBackKeyDown(event) {
            $('#btn-back').trigger('click');
            event.preventDefault();
        }
    });
    
    Array.prototype.sortByKey = function(key) {
        this.sort(function(a, b) {
            var x = a[key].toLowerCase(); 
            var y = b[key].toLowerCase();
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        });
    };
    
    function showExitConfirm() {
        window.confirm('Exit PhoneGap Sync?', 'Confirm Exit', ['Exit', 'Cancel'], function(buttonIndex) {
            if (buttonIndex == 1) {
                navigator.app.exitApp(); // close the app
            }
        });
    }
    
    function showLoader() {
        loadIcon.show();
    }
    
    function hideLoader() {
        loadIcon.hide();
    }

    return {
        path: '/',
        listDropboxFolder: new DropboxView().listFolder,
        showWelcomeView: showWelcomeView,
        showFileUploadView: showFileUploadView,
        showDropboxView: showDropboxView,
        showExitConfirm: showExitConfirm,
        loadIcon: loadIcon,
        showLoader: showLoader,
        hideLoader: hideLoader
    }
    
})();

// Called from onActivityResult in the app's main activity (dropboxAndroidCordova)
function dropbox_linked() {
    app.showDropboxView();
}

// Called by observer in DropboxSync plugin when there's a change to the status of background synchronization (download/upload)
function dropbox_onSyncStatusChange(status) {
    (status == 'none') ? app.hideLoader() : app.showLoader();
}

// Called by observer in DropboxSync plugin when a file is changed
function dropbox_fileChange() {
	app.listDropboxFolder();
}
