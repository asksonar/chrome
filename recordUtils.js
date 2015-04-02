var FORMAT = 'webp';
var CANVAS_WIDTH; // = 1280;
var CANVAS_HEIGHT; // = 720;
var QUALITY = 1;
var FPS = 10;

var desktop_sharing = false;
var local_stream = null;
var audio_context = new AudioContext();
var recorder;
var ws = null;
var encoder = new Whammy.Video(FPS);

function startVideoRecording(callback) {
  if (ws == null || ws.readyState == 2 || ws.readyState == 3) {
    ws = new WebSocket('ws://localhost:5000/');
  }

  if (desktop_sharing) {
    return;
  }
  chrome.desktopCapture.chooseDesktopMedia(["screen"], function(desktop_id) {
    onAccessApproved(desktop_id);
    if (callback) {
      callback();
    }
  });
}

function stopVideoRecording(callback) {
  if (!desktop_sharing) {
    return;
  }

  desktop_sharing = false;

  if (local_stream) {
    local_stream.stop();
  }
  local_stream = null;

  //document.querySelector('button').innerHTML = "Enable Capture";
  console.log('Desktop sharing stopped...');

  if (callback) {
    callback();
  }
}

function dataURItoArrayBuffer(dataURI) {
  // convert base64 to raw binary data held in a string
  // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
  var byteString = atob(dataURI.split(',')[1]);

  // separate out the mime component
  var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

  // write the bytes of the string to an ArrayBuffer
  var ab = new ArrayBuffer(byteString.length);
  var ia = new Uint8Array(ab);
  for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
  }

  return ab;
}



var totalTime = 0;
var totalCount = 0;

function onAccessApproved(desktop_id) {
    if (!desktop_id) {
        console.log('Desktop Capture access rejected.');
        return;
    }

    CANVAS_WIDTH = screen.width; //1280;
    CANVAS_HEIGHT = screen.height; //720;

    desktop_sharing = true;
    //document.querySelector('button').innerHTML = "Disable Capture";
    console.log("Desktop sharing started.. desktop_id:" + desktop_id);

    var rafId;

    var canvas = document.querySelector('canvas');
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    var video = document.querySelector('#screen-share');
    video.width = CANVAS_WIDTH;
    video.height = CANVAS_HEIGHT;


    var ctx = canvas.getContext("2d");

    /*
    var worker = new Worker('screenshotWorker.js');
    worker.postMessage({
      command: 'init',
      config: {
        mimetype: 'image/' + FORMAT
      }
    });
    */



    function drawVideoFrame(time) {
      var now = new Date();

      //rafId = requestAnimationFrame(drawVideoFrame);
      ctx.drawImage(video, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      encoder.add(ctx);
      //var base64 = canvas.toDataURL('image/' + FORMAT, QUALITY);
      /*
      var buffer = dataURItoArrayBuffer(base64);
      worker.postMessage({
        command: 'record',
        buffer: buffer
      }, [buffer]);
      */
      totalTime += new Date() - now;
      totalCount += 1;
    };

    navigator.webkitGetUserMedia({
        audio: false,
        video: {
            mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: desktop_id,
                minWidth: CANVAS_WIDTH,
                maxWidth: CANVAS_WIDTH,
                minHeight: CANVAS_HEIGHT,
                maxHeight: CANVAS_HEIGHT
            }
        }
    }, gotStream, getUserMediaError);

    function gotStream(stream) {
        local_stream = stream;
        video.src = URL.createObjectURL(stream);

        ws.send(JSON.stringify({
          'command': 'data.start',
          'params': {
            'time': new Date()
          }
        }));

        var screenCapture = window.setInterval(drawVideoFrame, 1000 / FPS);
        //rafId = requestAnimationFrame(drawVideoFrame);
        stream.onended = function() {
            // if (desktop_sharing) {
            //     toggle();
            // }
            window.clearInterval(screenCapture);
            //cancelAnimationFrame(rafId);
            console.log("Frame time avg: " + (totalTime / totalCount));

            var blob = encoder.compile();
            var fr = new FileReader();
            fr.onloadend = function() {
              ws.send(JSON.stringify({
                'command': 'video.step',
                'params': {
                  'userScenarioUUID': userScenarioUUID,
                  'currentStep': currentStep
                },
                'data': fr.result
              }));
            }
            fr.readAsDataURL(blob);

            //ws_video.send(JSON.stringify({command: 'finish'}));
            //worker.postMessage({command: 'save'});

            //var webmBlob = Whammy.fromImageArray(frames, 1000 / 5);
            //var videoResult = document.querySelector('#screen-share-result');
            //video.src = window.URL.createObjectURL(webmBlob);
        };
    }

    function getUserMediaError(e) {
      console.log('getUserMediaError: ' + JSON.stringify(e, null, '---'));
    }

/*
    navigator.webkitGetUserMedia({audio: true}, startUserMedia, function(e) {
      __log('No live audio input: ' + e);
    });
*/


}

/**
 * Click handler to init the desktop capture grab
 */
//document.querySelector('button').addEventListener('click', function(e) {
//    toggle();
//});


function __log(e, data) {
  console.log(e + " " + (data || ''));
}

function prepAudioRecording(callback) {
  if (!callback) {
    throw 'Need to have a callback for prepAudioRecording';
  }
  if (!recorder) {
    navigator.webkitGetUserMedia({audio: true}, function(stream) {

      var input = audio_context.createMediaStreamSource(stream);
      __log('Media stream created.');
      // Uncomment if you want the audio to feedback directly
      //input.connect(audio_context.destination);
      //__log('Input connected to audio context destination.');

      recorder = new Recorder(input, {'bufferLen': 16384});
      __log('Recorder initialised.');

      callback();
    }, function(e) {
        __log('No live audio input: ' + e);
    });
  } else {
    callback();
  }
}

function startAudioRecording(callback) {
  prepAudioRecording(function(){
    recorder && recorder.record();
    /*
    button.disabled = true;
    button.nextElementSibling.disabled = false;
    */
    __log('Recording...');

    if (callback) {
      callback();
    }
  });
}

function stopAudioRecording(callback) {
  recorder && recorder.stop();
  /*
  button.disabled = true;
  button.previousElementSibling.disabled = false;
  */
  __log('Stopped recording.');

  ws.send(JSON.stringify({
    'command': 'data.finish',
    'params': {
      'time': new Date(),
      'feelings': {

      }
    }
  }));

  // create WAV download link using audio data blob
  //createDownloadLink();
  recorder && recorder.exportWAV();

  recorder.clear();

  if (callback) {
    callback();
  }
}

/*
function createDownloadLink() {
  recorder && recorder.exportWAV(function(blob) {
    var url = URL.createObjectURL(blob);
    var li = document.createElement('li');
    var au = document.createElement('audio');
    var hf = document.createElement('a');

    au.controls = true;
    au.src = url;
    hf.href = url;
    hf.download = new Date().toISOString() + '.wav';
    hf.innerHTML = hf.download;
    li.appendChild(au);
    li.appendChild(hf);
    document.getElementById('recordingsList').appendChild(li);
  });
}
*/


/*
window.onload = function init() {
  try {
    // webkit shim
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;
    window.URL = window.URL || window.webkitURL;


    __log('Audio context set up.');
    __log('navigator.getUserMedia ' + (navigator.getUserMedia ? 'available.' : 'not present!'));
  } catch (e) {
    alert('No web audio support in this browser!');
  }


};

*/
