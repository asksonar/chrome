function FileSystemController() {
  this.init();
}

FileSystemController.prototype.init = function() {
  window.webkitRequestFileSystem(window.PERSISTENT, 0, $.proxy(function(filesystem) {
    this.fs = filesystem;
  }, this), $.proxy(this.requestFSErrorHandler, this));
}

FileSystemController.prototype.requestFSErrorHandler = function() {
  console.log("Error getting filesystem");
  debugger;
}

FileSystemController.prototype.checkFileStorage = function() {
  navigator.webkitPersistentStorage.queryUsageAndQuota(function(usedBytes, availableBytes) {
    console.log("Used " + (usedBytes/1000000) + " MB out of " + (availableBytes/1000000) + " MB");
  });
}

FileSystemController.prototype.listDirectory = function(dir) {
  var dirReader = dir.createReader();
  dirReader.readEntries (function(results) {
    debugger;
  });
}

FileSystemController.prototype.getFile = function(path, callback) {
  var gotFile = function(file) {
    callback(file);
  }

  var gotFileEntry = function(fileEntry) {
    fileEntry.file(gotFile);
  }

  var errorFile = function(fileError) {
    console.log(fileError);
  }

  this.fs.root.getFile(path, {}, gotFileEntry, errorFile);
}
