function writeJpegsToDisk() {
  chrome.fileSystem.chooseEntry( {type:'openDirectory'}, function(entry) {
      chrome.fileSystem.getWritableEntry(entry, function(entry) {
          for (var i = 0; i < frames.length; i++) {

            var str = "" + i;
            var pad = "0000";
            var ans = pad.substring(0, pad.length - str.length) + str;

            entry.getFile('file' + ans + '.' + FORMAT, {create:true}, function(entry) {
                entry.createWriter(function(writer) {
                    writer.write( frames.shift(), {type: 'image/' + FORMAT} );
                });
            });
          }

          /*
          entry.getFile('file2.txt', {create:true}, function(entry) {
              entry.createWriter(function(writer) {
                  writer.write(new Blob(['Ipsum'], {type: 'text/plain'}));
              });
          });
          */
      });
  });

  /*
  var writableEntry = chrome.fileSystem.getWritableEntry(entry, callback);

  for(var i = 0; i < frames.length; i++) {
    writeFileEntry(writableEntry, dataURItoBlob(frames[i]));
  }
  */
}


function writeFileEntry(writableEntry, opt_blob, callback) {
  if (!writableEntry) {
    output.textContent = 'Nothing selected.';
    return;
  }

  writableEntry.createWriter(function(writer) {

    writer.onerror = errorHandler;
    writer.onwriteend = callback;

    // If we have data, write it to the file. Otherwise, just use the file we
    // loaded.
    if (opt_blob) {
      writer.truncate(opt_blob.size);
      waitForIO(writer, function() {
        writer.seek(0);
        writer.write(opt_blob);
      });
    }
    else {
      chosenEntry.file(function(file) {
        writer.truncate(file.fileSize);
        waitForIO(writer, function() {
          writer.seek(0);
          writer.write(file);
        });
      });
    }
  }, errorHandler);
}

function waitForIO(writer, callback) {
  // set a watchdog to avoid eventual locking:
  var start = Date.now();
  // wait for a few seconds
  var reentrant = function() {
    if (writer.readyState===writer.WRITING && Date.now()-start<4000) {
      setTimeout(reentrant, 100);
      return;
    }
    if (writer.readyState===writer.WRITING) {
      console.error("Write operation taking too long, aborting!"+
        " (current writer readyState is "+writer.readyState+")");
      writer.abort();
    }
    else {
      callback();
    }
  };
  setTimeout(reentrant, 100);
}
