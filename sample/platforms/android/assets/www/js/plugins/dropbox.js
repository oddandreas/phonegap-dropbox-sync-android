var dropbox = (function() {

    var pluginName = "DropboxSync",
        exec = cordova.require("cordova/exec"),
        me = {};

    me.link = function() {
        var deferred = $.Deferred();
        exec(
            function(result) {
                setTimeout(function() {
                    deferred.resolve(result);
                }, 1000);
            },
            function(error) {
                deferred.reject(error);
            },
            pluginName, "link", [""]);
        return deferred.promise();
    }

    me.checkLink = function() {
        var deferred = $.Deferred();
        exec(
            function(result) {
                deferred.resolve(result);
            },
            function(error) {
                deferred.reject(error);
            },
            pluginName, "checkLink", [""]);
        return deferred.promise();
    }

    me.unlink = function() {
        var deferred = $.Deferred();
        exec(
            function(result) {
                deferred.resolve(result);
            },
            function(error) {
                deferred.reject(error);
            },
            pluginName, "unlink", [""]);
        return deferred.promise();
    }

    me.listFolder = function(dropboxPath) {
        var deferred = $.Deferred();
        exec(
            function(result) {
                deferred.resolve(result);
            },
            function(error) {
                deferred.reject(error);
            },
            pluginName, "listFolder", [dropboxPath]);
        return deferred.promise();
    }

    me.addObserver = function(dropboxPath) {
        var deferred = $.Deferred();
        exec(
            function(result) {
                deferred.resolve(result);
            },
            function(error) {
                deferred.reject(error);
            },
            pluginName, "addObserver", [dropboxPath]);
        return deferred.promise();
    }

    me.getImageBase64String = function(dropboxFilePath) {
        var deferred = $.Deferred();
        exec(
            function(result) {
                deferred.resolve(result);
            },
            function(error) {
                deferred.reject();
            },
            pluginName, "getImageBase64String", [dropboxFilePath]);
        return deferred.promise();
    }

    me.readString = function(dropboxFilePath) {
        var deferred = $.Deferred();
        exec(
            function(result) {
                deferred.resolve(result);
            },
            function(error) {
                deferred.reject();
            },
            pluginName, "readString", [dropboxFilePath]);
        return deferred.promise();
    }
    
    me.uploadFile = function(options) {
        var deferred = $.Deferred(),
            defaults = {
                dropboxPath: '/',
            }, 
            options = $.extend({}, defaults, options);
            if (! options.filePath) {
                alert('Specify local file path for upload.');
                return deferred.reject();
            }
        exec(
            function(result) {
                deferred.resolve(result);
            },
            function(error) {
                deferred.reject();
            },
            pluginName, "uploadFile", 
            [options.filePath, options.dropboxPath]
        );
        return deferred.promise();
    }
    
    me.uploadFolder = function(options) {
        var deferred = $.Deferred(),
            defaults = {
                dropboxPath: '/',
                doRecursive: false
            }, 
            options = $.extend({}, defaults, options);
            if (! options.folderPath) {
                alert('Specify local folder path for upload.');
                return deferred.reject();
            }
        exec(
            function(result) {
                deferred.resolve(result);
            },
            function(error) {
                deferred.reject();
            },
            pluginName, "uploadFolder", 
            [options.folderPath, options.dropboxPath, options.doRecursive]
        );
        return deferred.promise();
    }
    
    me.deleteFile = function(dropboxFilePath) {
        var deferred = $.Deferred();
        exec(
            function(result) {
                deferred.resolve(result);
            },
            function(error) {
                deferred.reject();
            },
            pluginName, "deleteFile", [dropboxFilePath]);
        return deferred.promise();
    }
    
    me.createFolder = function(dropboxFilePath) {
        var deferred = $.Deferred();
        exec(
            function(result) {
                deferred.resolve(result);
            },
            function(error) {
                deferred.reject();
            },
            pluginName, "createFolder", [dropboxFilePath]);
        return deferred.promise();
    }
    
    me.openFile = function(dropboxFilePath) {
        var deferred = $.Deferred();
        exec(
            function(result) {
                deferred.resolve(result);
            },
            function(error) {
                deferred.reject();
            },
            pluginName, "openFile", [dropboxFilePath]);
        return deferred.promise();
    }

    return me;

})();