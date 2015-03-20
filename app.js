/*
Copyright 2014 Intel Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

Author: Dongseong Hwang (dongseong.hwang@intel.com)
*/

/**
 * Grabs the desktop capture feed from the browser, requesting
 * desktop capture. Requires the permissions
 * for desktop capture to be set in the manifest.
 *
 * @see https://developer.chrome.com/apps/desktopCapture
 */
var desktop_sharing = false;
var local_stream = null;
var audio_context = new AudioContext;

function toggle() {
    if (!desktop_sharing) {
        chrome.desktopCapture.chooseDesktopMedia(["screen", "window"], onAccessApproved);
    } else {
        desktop_sharing = false;

        if (local_stream)
            local_stream.stop();
        local_stream = null;

        document.querySelector('button').innerHTML = "Enable Capture";
        console.log('Desktop sharing stopped...');

        stopRecording();
    }
}

var totalTime = 0;
var totalCount = 0;

function onAccessApproved(desktop_id) {
    if (!desktop_id) {
        console.log('Desktop Capture access rejected.');
        return;
    }
    desktop_sharing = true;
    document.querySelector('button').innerHTML = "Disable Capture";
    console.log("Desktop sharing started.. desktop_id:" + desktop_id);

    var rafId;
    var frames = [];

    var canvas = document.querySelector('canvas');
    var video = document.querySelector('#screen-share');

    var CANVAS_WIDTH = 1280; //canvas.width;
    var CANVAS_HEIGHT = 720; //canvas.height;

    var ctx = canvas.getContext("2d");

    function drawVideoFrame(time) {
      //rafId = requestAnimationFrame(drawVideoFrame);
      ctx.drawImage(video, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      var now = new Date();
      frames.push(canvas.toDataURL('image/webp', 1.0));
      totalTime += new Date() - now;
      totalCount += 1;
    };

    navigator.webkitGetUserMedia({
        audio: false,
        video: {
            mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: desktop_id,
                minWidth: 1280,
                maxWidth: 1280,
                minHeight: 720,
                maxHeight: 720
            }
        }
    }, gotStream, getUserMediaError);


    function gotStream(stream) {
        local_stream = stream;
        video.src = URL.createObjectURL(stream);
        var screenCapture = window.setInterval(drawVideoFrame, 100);
        //rafId = requestAnimationFrame(drawVideoFrame);
        stream.onended = function() {
            if (desktop_sharing) {
                toggle();
            }
            window.clearInterval(screenCapture);
            //cancelAnimationFrame(rafId);
            console.log("Frame time avg: " + (totalTime / totalCount));
            debugger;
            var webmBlob = Whammy.fromImageArray(frames, 1000 / 10);
            //var videoResult = document.querySelector('#screen-share-result');
            video.src = window.URL.createObjectURL(webmBlob);


        };


        navigator.webkitGetUserMedia({audio: true}, startUserMedia, function(e) {
          __log('No live audio input: ' + e);
        });

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
document.querySelector('button').addEventListener('click', function(e) {
    toggle();
});


function __log(e, data) {
  console.log(e + " " + (data || ''));
}

var audio_context;
var recorder;

function startUserMedia(stream) {
  var input = audio_context.createMediaStreamSource(stream);
  __log('Media stream created.');
  // Uncomment if you want the audio to feedback directly
  //input.connect(audio_context.destination);
  //__log('Input connected to audio context destination.');

  recorder = new Recorder(input);
  __log('Recorder initialised.');

  startRecording();
}
function startRecording(button) {
  recorder && recorder.record();
  /*
  button.disabled = true;
  button.nextElementSibling.disabled = false;
  */
  __log('Recording...');
}
function stopRecording(button) {
  recorder && recorder.stop();
  /*
  button.disabled = true;
  button.previousElementSibling.disabled = false;
  */
  __log('Stopped recording.');

  // create WAV download link using audio data blob
  createDownloadLink();

  recorder.clear();
}
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
