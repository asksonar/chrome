/**
 * Listens for the app launching then creates the window
 *
 * @see http://developer.chrome.com/apps/app.runtime.html
 * @see http://developer.chrome.com/apps/app.window.html
 */

$(function(){
  chrome.app.runtime.onLaunched.addListener(launchApp);

  var MARGIN = 10;
  var WIDTH = 400;
  var HEIGHT = 136;

  // var scenarioResultHashId;
  // var currentStep;

  chrome.runtime.onMessageExternal.addListener(
    function(request, sender, sendResponse) {
      //if (sender.url == blacklistedWebsite)
      //  return;  // don't allow this web page access
      if (request.launchApp) {
        var launchAppParams = {};
        chrome.storage.local.set(request.launchApp);
        launchApp(Object.keys(request.launchApp)[0]);
      }
    }
  );

  function launchApp(scenarioResultHashId) {
    currentWindow = chrome.app.window.create('popup.html?scenarioResultHashId=' + scenarioResultHashId, {
      id: "desktopCaptureID",
      frame: 'none',
      focused: true,
      alwaysOnTop: true,
      state: 'normal',
      hidden: true,
      outerBounds: {
        width: WIDTH,
        height: HEIGHT,
        top: 0,
        left: (screen.width - WIDTH - MARGIN)
      }
    }, function(createdWindow) {
      createdWindow.outerBounds.width = WIDTH;
      createdWindow.outerBounds.height = HEIGHT;
      createdWindow.outerBounds.top = 0;
      createdWindow.outerBounds.left = screen.width - WIDTH - MARGIN;
      createdWindow.show();
    });
  }

  window.eventBus = $({});
  window.model = new BackgroundModel(eventBus);
  window.controller = new BackgroundController(eventBus, model);
  window.websocket = new WebsocketController(eventBus, model, {
    'websocketUrl': 'ws://localhost:5000/'
  });
  window.video = new VideoController(eventBus, model, {
    'canvas': document.getElementById('canvas'),
    'video': document.getElementById('video'),
    'fps': 10
  });
  window.audio = new AudioController(eventBus, model);

});

/*
    if (msg.command == 'start') {
      userScenarioUUID = msg.userScenarioUUID;
      currentStep = msg.currentStep;

      startVideoRecording(function() {
        startAudioRecording(function(){
          port.postMessage({'command': 'started'});
        });
      });
    } else if (msg.command == 'next') {
      userScenarioUUID = msg.userScenarioUUID;
      currentStep = msg.currentStep;

      stopAudioRecording(startAudioRecording);
    } else if (msg.command == 'finish') {
      userScenarioUUID = msg.userScenarioUUID;
      currentStep = msg.currentStep;

      stopAudioRecording(function(){
        stopVideoRecording(function(){
          port.postMessage({'command': 'stopped'});
          userScenarioUUID = null;
          currentStep = null;
        });
      });
    } else if (msg.command == 'close') {
      userScenarioUUID = msg.userScenarioUUID;
      currentStep = msg.currentStep;

      stopAudioRecording(function(){
        stopVideoRecording(function(){
          port.postMessage({'command': 'closed'});
          userScenarioUUID = null;
          currentStep = null;
        });
      });
    } else {
      console.log('Unrecognized command ' + msg.command);
    }
  });
});
*/
