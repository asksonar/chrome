$(function(){
  chrome.app.runtime.onLaunched.addListener(launchApp);

  var MARGIN = 10;
  var WIDTH = 400;
  var HEIGHT = 136;

  chrome.runtime.onMessageExternal.addListener(
    function(request, sender, sendResponse) {
      if (request === 'isInstalledApp?') {
        sendResponse(true);
      } else if (request.launchApp) {
        if (chrome.app.window.get("sonarDesktopCapture")) {
          sendResponse('A study is already in progress.');
        } else {
          var launchAppParams = {};
          chrome.storage.local.set(request.launchApp);
          launchApp(Object.keys(request.launchApp)[0]);
          sendResponse(true);
        }
      }
    }
  );

  function launchApp(scenarioResultHashId) {
    currentWindow = chrome.app.window.create('popup.html?scenarioResultHashId=' + scenarioResultHashId, {
      id: "sonarDesktopCapture",
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
  window.ajaxer = new AjaxerController(eventBus, model, {
    'url': 'http://video.asksonar.com/'
    // 'url': 'http://localhost:5000/'
  });

  window.recorder = new RecorderController(eventBus, model, {
    'encoderUrl': '/manifest_encoder.nmf',
    'fps': 10
  });

});
