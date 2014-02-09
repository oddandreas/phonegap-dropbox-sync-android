package com.rossmartin.dropbox;

import org.apache.cordova.*;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.database.Cursor;
import android.net.Uri;
import android.provider.MediaStore;
import android.util.Log;

import java.io.BufferedInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.net.URL;
import java.net.URLDecoder;
import java.util.ArrayList;
import java.util.List;

import com.dropbox.sync.android.DbxAccountManager;
import com.dropbox.sync.android.DbxException;
import com.dropbox.sync.android.DbxException.Unauthorized;
import com.dropbox.sync.android.DbxFileInfo;
import com.dropbox.sync.android.DbxFileStatus;
import com.dropbox.sync.android.DbxFileSystem;
import com.dropbox.sync.android.DbxPath;
import com.dropbox.sync.android.DbxFileSystem.PathListener.Mode;
import com.dropbox.sync.android.DbxFile;
import com.dropbox.sync.android.DbxSyncStatus;


/**
 * PhoneGap Dropbox Sync Plugin for Android - Ross Martin 8/21/13.
 */
public class DropboxPlugin extends CordovaPlugin {
    
    private static final String TAG = "DropboxPlugin";
    private static final String PLUGIN_ERROR = "DropboxPlugin Error";
    private static final String APP_KEY = "81v5tm7jg21zk8c"; // Your app key here
    private static final String APP_SECRET = "f9cwicck72tuhpx"; // Your app secret here
    static final int REQUEST_LINK_TO_DBX = 1337;  // This value is up to you, it must be the same as in your main activity though
    private DbxAccountManager mDbxAcctMgr;
    private static List<File> localFileList;
    
    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
        Log.v(TAG, "execute method starting");
        mDbxAcctMgr = DbxAccountManager.getInstance(cordova.getActivity().getApplicationContext(), APP_KEY, APP_SECRET);
        if (action.equals("checkLink")) {
            this.checkLink(callbackContext);
            return true;
        } else if (action.equals("link")) {
            this.link(callbackContext);
            return true;
        } else if (action.equals("unlink")) {
            this.unlink(callbackContext);
            return true;
        } else if (action.equals("listFolder")) {
            String path = args.getString(0);
            this.listFolder(path, callbackContext);
            return true;
        } else if (action.equals("addObserver")) {
            String path = args.getString(0);
            this.addObserver(path, callbackContext);
            return true;
        } else if (action.equals("readData")) {
            String path = args.getString(0);
            this.readData(path, callbackContext);
            return true;
        } else if (action.equals("readString")) {
            String path = args.getString(0);
            this.readString(path, callbackContext);
            return true;
        } else if (action.equals("uploadFile")) {
            String localPath = args.getString(0);
            String dropboxPath = args.getString(1);
            if (! dropboxPath.endsWith("/")) {
                dropboxPath += "/";
            }
            this.uploadFile(localPath, dropboxPath, callbackContext);
            return true;
        } else if (action.equals("uploadFolder")) {
            String localPath = args.getString(0);
            String dropboxPath = args.getString(1);
            if (! dropboxPath.endsWith("/")) {
                dropboxPath += "/";
            }
            boolean doRecursive = args.getBoolean(2);
            this.uploadFolder(localPath, dropboxPath, doRecursive, callbackContext);
            return true;
        }
        return false;
    }
    
    private void checkLink(CallbackContext callbackContext) {
        Log.v(TAG, "checkLink method executing");
        if (mDbxAcctMgr.hasLinkedAccount()){
            callbackContext.success();
        } else {
            callbackContext.error("User not authenticated yet");
        }
    }

    private void link(CallbackContext callbackContext) {
        Log.v(TAG, "link method executing");
        mDbxAcctMgr.startLink(cordova.getActivity(), REQUEST_LINK_TO_DBX);
        callbackContext.success();
    }
    
    private void unlink(CallbackContext callbackContext) {
        Log.v(TAG, "unlink method executing");
        mDbxAcctMgr.unlink();
        callbackContext.success();
    }
    
    private void listFolder(final String path, final CallbackContext callbackContext) {
        Log.v(TAG, "listFolder method executing");
        cordova.getThreadPool().execute(new Runnable() {
            public void run() {
                DbxFileSystem dbxFs;
                JSONArray jsonArray = new JSONArray();
                try {
                    dbxFs = DbxFileSystem.forAccount(mDbxAcctMgr.getLinkedAccount());
                    List<DbxFileInfo> infos = dbxFs.listFolder(new DbxPath(path));
                    for (DbxFileInfo info : infos) {
                        JSONObject dbFile = new JSONObject();
                        dbFile.put("path", info.path);
                        dbFile.put("modifiedTime", info.modifiedTime);
                        dbFile.put("size", info.size);
                        dbFile.put("isFolder", info.isFolder);
                        jsonArray.put(dbFile);
                    }
                    callbackContext.success(jsonArray);
                } catch (Exception e) {
                    e.printStackTrace();
                    callbackContext.error(PLUGIN_ERROR);
                }
            }
        });
        
    }
    
    private void addObserver(final String path, final CallbackContext callbackContext) {
        Log.v(TAG, "addObserver method executing");
        cordova.getThreadPool().execute(new Runnable() {
            public void run() {
                DbxFileSystem dbxFs;
                try {
                    dbxFs = DbxFileSystem.forAccount(mDbxAcctMgr.getLinkedAccount());
                    dbxFs.addPathListener(new DbxFileSystem.PathListener() {
                        @Override
                        public void onPathChange(DbxFileSystem arg0, DbxPath arg1, Mode arg2) {
                            webView.loadUrl("javascript:dropbox_fileChange();");
                        }
                        
                    }, new DbxPath(path), Mode.PATH_OR_CHILD);
                    
                    dbxFs.addSyncStatusListener(new DbxFileSystem.SyncStatusListener() {
                        @Override
                        public void onSyncStatusChange(DbxFileSystem fs) {
                            try {
                                DbxSyncStatus dbSyncStatus = fs.getSyncStatus();
                                if (! dbSyncStatus.anyInProgress()) {
                                    webView.loadUrl("javascript:dropbox_onSyncStatusChange('none');");
                                } else {
                                    webView.loadUrl("javascript:dropbox_onSyncStatusChange('sync');");
                                }
                            } catch (DbxException e) {
                                e.printStackTrace();
                            }
                        }
                    });
                } catch (Unauthorized e) {
                    e.printStackTrace();
                    callbackContext.error(PLUGIN_ERROR);
                }
            }
        });
    }
    
    private void readData(final String path, final CallbackContext callbackContext) {
        Log.v(TAG, "readData method executing");
        cordova.getThreadPool().execute(new Runnable() {
            public void run() {
                DbxFileSystem dbxFs;
                
                try {
                    dbxFs = DbxFileSystem.forAccount(mDbxAcctMgr.getLinkedAccount());
                    DbxPath filePath = new DbxPath(path);
                    DbxFile file = dbxFs.open(filePath);
                    try {
                        FileInputStream contents = file.getReadStream();
                        BufferedInputStream buf = new BufferedInputStream(contents);
                        ByteArrayOutputStream baos = new ByteArrayOutputStream();
                        // read until a single byte is available
                        while(buf.available() > 0) {
                           // read the byte and convert the integer to character
                           char c = (char)buf.read();
                           baos.write(c);
                        }
                        callbackContext.success(baos.toByteArray());
                        baos.flush();
                        buf.close();
                    } catch (IOException e) {
                        e.printStackTrace();
                        callbackContext.error(PLUGIN_ERROR);
                    } finally {
                        file.close();
                    }
                    
                } catch (Exception e) {
                    e.printStackTrace();
                    callbackContext.error(PLUGIN_ERROR);
                }
            }
        });
        
        
    }
    
    private void readString(final String path, final CallbackContext callbackContext) {
        Log.v(TAG, "readString method executing");
        cordova.getThreadPool().execute(new Runnable() {
            public void run() {
                DbxFileSystem dbxFs;
                
                try {
                    dbxFs = DbxFileSystem.forAccount(mDbxAcctMgr.getLinkedAccount());
                    DbxPath filePath = new DbxPath(path);
                    DbxFile file = dbxFs.open(filePath);
                    try {
                        String contents = file.readString();
                        callbackContext.success(contents);
                    } catch (IOException e) {
                        e.printStackTrace();
                        callbackContext.error(PLUGIN_ERROR);
                    } finally {
                        file.close();
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                    callbackContext.error(PLUGIN_ERROR);
                }
            }
        });
    }
    
    private void uploadFile(final String localPath, final String dropboxPath, final CallbackContext callbackContext) {
        Log.v(TAG, "uploadFile method executing");
        cordova.getThreadPool().execute(new Runnable() {
            public void run() {
                DbxFileSystem dbxFs;
                
                try {
                    dbxFs = DbxFileSystem.forAccount(mDbxAcctMgr.getLinkedAccount());
                    File uploadFile = resolveLocalFileSystemURI(localPath);
                    Log.v(TAG, "dropboxPath + uploadFile.getName() -> " + dropboxPath + uploadFile.getName());
                    DbxPath filePath = new DbxPath(dropboxPath + uploadFile.getName());
                    DbxFile dbxFile;
                    if (dbxFs.exists(filePath)){
                        dbxFile = dbxFs.open(filePath);
                    } else {
                        dbxFile = dbxFs.create(filePath);
                    }
                    dbxFile.writeFromExistingFile(uploadFile, false);
                    dbxFs.syncNowAndWait();
                    dbxFile.close();
                    callbackContext.success();
                } catch (Exception e) {
                    e.printStackTrace();
                    callbackContext.error(PLUGIN_ERROR);
                }
            }
        });
    }
    
    private void uploadFolder(final String localPath, final String dropboxPath, final boolean doRecursive, final CallbackContext callbackContext) {
        Log.v(TAG, "uploadFolder method executing");
        cordova.getThreadPool().execute(new Runnable() {
            public void run() {
                DbxFileSystem dbxFs;
                
                try {
                    dbxFs = DbxFileSystem.forAccount(mDbxAcctMgr.getLinkedAccount());
                    File uploadPath = resolveLocalFileSystemURI(localPath);
                    localFileList = new ArrayList<File>();
                    if (doRecursive) {
                        directorySearch(uploadPath, true);
                    } else {
                        directorySearch(uploadPath, false);
                    }
                    Log.v(TAG, "uploadFolder after directorySearch method call, localFileList -> " + localFileList + " \r\n\r\nRecursion: " + doRecursive);
                    if (localFileList.size() > 0) {
                        for (File file : localFileList) {
                            DbxFile dbxFile;
                            String parentName = uploadPath.getName();
                            int needle = file.getPath().indexOf(parentName);
                            String fileUploadName = file.getPath().substring(needle);
                            Log.v(TAG, "fileUploadName -> " + fileUploadName);
                            if (file.isDirectory()) {
                                DbxPath filePath = new DbxPath(dropboxPath + fileUploadName);
                                if (!dbxFs.exists(filePath)) {
                                    Log.v(TAG, "Creating new directory in Dropbox, directory name -> " + fileUploadName);
                                    dbxFs.createFolder(filePath);
                                }
                            } else {
                                DbxPath filePath = new DbxPath(dropboxPath + fileUploadName);
                                if (dbxFs.exists(filePath)) {
                                    dbxFile = dbxFs.open(filePath);
                                } else {
                                    dbxFile = dbxFs.create(filePath);
                                }
                                dbxFile.writeFromExistingFile(file, false);
                                dbxFs.syncNowAndWait();
                                dbxFile.close();
                            }
                        }
                    } else { // just an empty directory to make
                        if (uploadPath.isDirectory()) {
                            DbxPath filePath = new DbxPath(dropboxPath + uploadPath.getName());
                            if (!dbxFs.exists(filePath)) {
                                Log.v(TAG, "Creating new directory in Dropbox, directory name -> " + uploadPath.getName());
                                dbxFs.createFolder(filePath);
                            }
                        } 
                    }
                    callbackContext.success();
                } catch (Exception e) {
                    e.printStackTrace();
                    callbackContext.error(PLUGIN_ERROR);
                }
            }
        });
    }
        
    @SuppressWarnings("deprecation")
    private File resolveLocalFileSystemURI(String url) throws IOException, JSONException {
        String decoded = URLDecoder.decode(url, "UTF-8");

        File fp = null;

        // Handle the special case where you get an Android content:// uri.
        if (decoded.startsWith("content:")) {
            Cursor cursor = this.cordova.getActivity().managedQuery(Uri.parse(decoded), new String[] { MediaStore.Images.Media.DATA }, null, null, null);
            // Note: MediaStore.Images/Audio/Video.Media.DATA is always "_data"
            int column_index = cursor.getColumnIndexOrThrow(MediaStore.Images.Media.DATA);
            cursor.moveToFirst();
            fp = new File(cursor.getString(column_index));
        } else {
            // Test to see if this is a valid URL first
            @SuppressWarnings("unused")
            URL testUrl = new URL(decoded);

            if (decoded.startsWith("file://")) {
                int questionMark = decoded.indexOf("?");
                if (questionMark < 0) {
                    fp = new File(decoded.substring(7, decoded.length()));
                } else {
                    fp = new File(decoded.substring(7, questionMark));
                }
            } else {
                fp = new File(decoded);
            }
        }

        if (!fp.exists()) {
            throw new FileNotFoundException();
        }
        if (!fp.canRead()) {
            throw new IOException();
        }
        return fp;
    }
    
    private static void directorySearch(File dir, boolean recursive) {
        try {
            File[] files = dir.listFiles();
            for (File file : files) {
                localFileList.add(file);
                if (file.isDirectory()) {
                    Log.v(TAG, "directory:" + file.getCanonicalPath());
                    if (recursive) {
                        directorySearch(file, true);
                    }
                } else {
                    Log.v(TAG, "file:" + file.getCanonicalPath());
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
   
}