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
    if (typeof scenarioResultHashId != "string") {
      return;
    }

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
    //'url': 'http://localhost:5000/'
  });
  window.recorder = new RecorderController(eventBus, model, {
    'encoderUrl': '/manifest_encoder.nmf',
    'fps': 10
  });

  window.testLaunch = function() {
    var testData = {
      "YXjbMRzg":{
        "hashid":"2mP50myq",
        "description":"This a test of urls",
        "steps":[
          {
            "hashid":"8jjenddw",
            "description":"Bacon ipsum dolor amet pig consectetur irure ham, prosciutto tenderloin deserunt dolor. Elit strip steak pancetta, rump commodo andouille excepteur ut fugiat pork flank tongue tri-tip. Pork ipsum ut, cupim brisket turkey pork loin t-bone et cow ground round ribeye. Aliqua eiusmod enim doner brisket frankfurter eu kielbasa pork loin sunt officia bacon. Leberkas ball tip flank cupidatat pork chop meatloaf. Shankle enim laborum pariatur brisket irure.",
            "url":"www.yourwebsite.com"
          },
          {
            "hashid":"V3gW0ood",
            "description":"Has http",
            "url":"http://www.test.com/"
          },
          {
            "hashid":"8D0ewPP2",
            "description":"has https",
            "url":"https://reddit.com"
          },
          {
            "hashid":"V57O4oo5",
            "description":"Has no site",
            "url":""
          }
        ]
      }
    }

    chrome.storage.local.set(testData);
    launchApp(Object.keys(testData)[0]);
  }

});
