var dropbox = (function() {

    var pluginName = "DropboxSync",
        exec = cordova.require("cordova/exec"); // https://github.com/ccoenraets/phonegap-dropbox-sync/issues/2

    var link = function() {
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

    var checkLink = function() {
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

    var unlink = function() {
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

    var listFolder = function(dropboxPath) {
        var deferred = $.Deferred();
        exec(
            function(result) {
                deferred.resolve(result);
            },
            function(error) {
                console.log("getFiles error");
                deferred.reject(error);
            },
            pluginName, "listFolder", [dropboxPath]);
        return deferred.promise();
    }

    var addObserver = function(dropboxPath) {
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

    var readData = function(dropboxFilePath) {
        var deferred = $.Deferred();
        exec(
            function(result) {
                deferred.resolve(result);
            },
            function(error) {
                deferred.reject();
            },
            pluginName, "readData", [dropboxFilePath]);
        return deferred.promise();
    }

    var readString = function(dropboxFilePath) {
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
    
    var uploadFile = function(filePath, dropboxPath) {
        var deferred = $.Deferred();
        exec(
            function(result) {
                deferred.resolve(result);
            },
            function(error) {
                deferred.reject();
            },
            pluginName, "uploadFile", [filePath, dropboxPath]);
        return deferred.promise();
    }
    
    var uploadFolder = function(folderPath, dropboxPath, doRecursive) {
        var deferred = $.Deferred();
        exec(
            function(result) {
                deferred.resolve(result);
            },
            function(error) {
                deferred.reject();
            },
            pluginName, "uploadFolder", [folderPath, dropboxPath, doRecursive]);
        return deferred.promise();
    }
    
    var deleteFile = function(dropboxFilePath) {
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
    
    var createFolder = function(dropboxFilePath) {
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
    
    var openFile = function(dropboxFilePath) {
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

    return {
        link: link,
        checkLink: checkLink,
        unlink: unlink,
        listFolder: listFolder,
        addObserver: addObserver,
        readData: readData,
        readString: readString,
        uploadFile: uploadFile,
        uploadFolder: uploadFolder,
        deleteFile: deleteFile,
        createFolder: createFolder,
        openFile: openFile
    }

})();