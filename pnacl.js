var fs;
var tmp;

function startFileStorage() {
  window.webkitRequestFileSystem(window.PERSISTENT, 0, function(filesystem) {
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

function startPnacl() {
  debugger;

  var embedString = '<embed id="pnacl" width="0" height="0" src="ffmpeg.nmf" type="application/x-pnacl" ps_stdout="dev/tty" ps_stderr="dev/tty" ps_tty_prefix="" ';

  //var params = 'ffmpeg -y -v debug -nostdin -framerate 10 -i file\%d.jpeg -c:v libx264 -r 10 -pix_fmt yuv420p out.mp4';
  //var params = 'ffmpeg -f image2 -i img%d.jpg ffo.mpg';
  //var params = 'ffmpeg -formats';
  //var params = 'ffmpeg -f image2 -i file%04d.jpeg -r 12 -s WxH foo.avi';
  var params = 'ffmpeg -f image2 -pattern_type glob -i \'foo-*.jpeg\' -r 12 -s WxH foo.avi';

  var paramsList = params.split(' ');
  for(var i = 0; i < paramsList.length; i++) {
    embedString += ' arg' + i + '="' + paramsList[i] + '" ';
  }
  embedString += ' >';

  console.log(embedString);
  document.getElementById('div-pnacl').innerHTML = embedString;

  '' +
  ' arg1="-y" ' + /* overwrite output files without asking */
  ' arg2="-v" ' + /* set loglevel... */
  ' arg3="warning" ' + /* ... to warning */
  ' arg4="-stats" ' + /* Print encoding progress/statistics. It is on by default, to explicitly disable it you need to specify -nostats. */
  ' arg5="-nostdin" ' + /* Enable interaction on standard input. On by default unless standard input is used as an input. To explicitly disable interaction you need to specify -nostdin. */
  ' arg6="-i" arg7="infile" ' +
  ' arg8="-c:v" ' +
  ' arg9="libx264" ' +
  ' arg10="-c:a" ' +
  ' arg11="mp3" ' +
  ' arg12="-crf" ' +
  ' arg13="22" ' +
  ' arg14="out.mp4" ' +
  '>';

  var pnacl = document.getElementById("pnacl");


  pnacl.addEventListener('loadstart', eventStatus("Load Start"));
  pnacl.addEventListener('progress', eventProgress);
  pnacl.addEventListener('load', eventStatus("load"));
  pnacl.addEventListener('error', eventStatus("error"+pnacl.lastError));
  pnacl.addEventListener('abort', eventStatus("abort"+pnacl.lastError));
  pnacl.addEventListener('loadend', eventRunning);
  pnacl.addEventListener('message', function (ev) {
      if(ev.data.match(/^Libavutil has been linked to a broken llrint/)) return;
      if(ev.data.match(/^frame=/) || ev.data.match(/^size=/)) {
    var ti = ev.data.match(/time=..:..:../);
    if(document.cform.ctext.value != ti) document.cform.ctext.value = ti;
      }
      if((ev.data.match(/^frame=/) || ev.data.match(/^size=/))&& disable_stats) return;
      if(ev.data.match(/^[ ,\n,\r]*$/)  && disable_stats) return;
      var output = document.getElementById("output");
      output.textContent += ev.data;
  });

  pnacl.addEventListener('crash', function () {
      var totalTime = now() - time - 1000;
    if(totalTime<0) totalTime += 1000;
    totalTime = Math.round(totalTime/1000);
      if(pnacl.exitStatus == 0) {
    var output = document.getElementById("output");
    output.textContent += 'Finished processing (took ' + totalTime + 's)'
    updateStatus('Success!');
              var downlink = document.createElement('a');
        downlink.href = "filesystem:http://"+location.host+"/persistent/tmp/"+out_file;
              downlink.download = out_file;
              downlink.innerHTML = "<button>Download</button>";
        var objDownload = document.getElementById('download');
        objDownload.appendChild(downlink);
      } else {
          updateStatus("Exit code:"+pnacl.exitStatus);
      }
  });
}

function onError(err) {
    var msg = err.name+'\n'+err.message;
    alert(msg);
}

function onError2(err) {
    if(err.name == 'NotFoundError') return;
    var msg = err.name+'\n'+err.message;
    alert(msg);
}

function delete_tmp() {
    if(window.confirm('Delete /tmp OK?')==false) return;
    FS.root.getDirectory('/tmp', {}, function(dirEntry) {
  dirEntry.removeRecursively(function() {}, onError);
    }, onError2);
    FS.root.getFile('ffmpeg2pass-0.log', {}, function(fileEntry) {
  fileEntry.remove(function() {}, onError);
    }, onError2);
    FS.root.getFile('ffmpeg2pass-0.log.mbtree.temp', {}, function(fileEntry) {
  fileEntry.remove(function() {}, onError);
    }, onError2);

    FS.root.getFile('ffmpeg2pass-0.log.temp', {}, function(fileEntry) {
  fileEntry.remove(function() {}, onError);
    }, onError2);
}

var disable_stats = true;

function stats() {
    if(document.cform.cbox.checked) disable_stats = true;
    else disable_stats = false;
}

var statusText = 'NO-STATUSES';

function updateStatus(msg) {
    if(msg) {statusText = msg;}
    var statusField = document.getElementById('statusField');
    if(statusField) {statusField.innerHTML = statusText;}
}

function eventStatus(status) {
    return function () {
  updateStatus(status);
    }
}

function eventProgress(event) {
    var loadPercent = 0.0;
    var loadPercentString;
    if (event.lengthComputable && event.total > 0) {
  loadPercent = event.loaded / event.total * 100.0;
  loadPercentString = Math.round(loadPercent) + '%';
  updateStatus('Loading...' + loadPercentString);
    } else {
  updateStatus('Loading...');
    }
}

var now = Date.now;
var time;

function eventRunning() {
    updateStatus("Running");
    time = now();
}

/*
(function openFS() {
    navigator.webkitPersistentStorage.queryUsageAndQuota(function(used, remaining) {
    if(used+remaining < 1)
      navigator.webkitPersistentStorage.requestQuota(1024*1024*100000, function(bytes) {
            webkitRequestFileSystem(window.PERSISTENT,bytes, function(fs) {FS = fs;}, onError);});
    else webkitRequestFileSystem(window.PERSISTENT,1024*1024*100000, function(fs) {FS = fs;}, onError);
    }, onError );
})();

*/
