var fileCount = -1;
var mimetype = '';
var files;

this.onmessage = function(e) {
  switch(e.data.command) {
    case 'ping':
      console.log(e.data);
      break;
    case 'init':
      init(e.data.config);
      break;
    case 'record':
      record(e.data.buffer);
      break;
    case 'save':
      writeJpegsToDisk();
      break;
    case 'close':
      self.close();
      break;
  }
};

function init(config) {
  mimetype = config.mimetype;
  startFileStorage();
  createTmpDirectory();
  fileCount = -1;
}

function record(buffer) {
  fileCount += 1;

  var str = "" + fileCount;
  var pad = "0000";
  var ans = pad.substring(0, pad.length - str.length) + str;

  writeFile("file" + ans + ".jpeg", new Blob([buffer], {type:mimetype}));
}

var fs;
var tmp;

function startFileStorage() {
  webkitRequestFileSystem(PERSISTENT, 0, function(filesystem) {
    fs = filesystem;
  });
}

/** should always have at least 1,000 MB to work with? at least until we become more efficient... **/
function checkFileStorage() {
  navigator.webkitPersistentStorage.queryUsageAndQuota(function(usedBytes, availableBytes) {
    console.log("Used " + (usedBytes/1000000) + " MB out of " + (availableBytes/1000000) + " MB");
  });
}

function createTmpDirectory() {
  fs.root.getDirectory('tmp', {create: true}, function(dirEntry) {
    tmp =  dirEntry;
  });
}

function listDirectory(dir) {
  var dirReader = dir.createReader();
  dirReader.readEntries (function(results) {
    debugger;
  });
}

function writeFile(filename, blob) {

  var createWriterCallback = function(fileWriter) {
    fileWriter.write(blob);
  };

  var getFileCallback = function(fileEntry) {
    fileEntry.createWriter(createWriterCallback);
  }

  fs.root.getFile(filename, {create: true}, getFileCallback);
}
