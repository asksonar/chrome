function BackgroundController(eventBus, ajaxer, model) {
  this.eventBus = eventBus;
  this.ajaxer = ajaxer;
  this.model = model;

  this.init();
  this.initHandlers();
}

BackgroundController.prototype.init = function() {
}

BackgroundController.prototype.initHandlers = function() {
  this.eventBus.on('start', this.onStarted, this);
  this.eventBus.on('next', this.onNexted, this);
  this.eventBus.on('finish', this.onFinished, this);
  this.eventBus.on('abort', this.onAborted, this);
  this.eventBus.on('delighted', this.onDelighted, this);
  this.eventBus.on('confused', this.onConfused, this);
  this.eventBus.on('noted', this.onNoted, this);
  this.eventBus.on('titled', this.onTitled, this);

  this.eventBus.on('muteRecording', this.onMuteRecording, this);
  this.eventBus.on('unmuteRecording', this.onUnmuteRecording, this);

  chrome.runtime.onMessageExternal.addListener($.proxy(this.onMessaged, this));
  chrome.app.runtime.onLaunched.addListener($.proxy(this.onLaunched, this));
}

BackgroundController.prototype.onMessaged = function(request, sender, sendResponse) {
  if (request === 'isInstalledApp?') {
    sendResponse(true);
  } else if (request === 'update!') {
    this.update(sendResponse);
    return true; // indicates aysnch-ness
  } else if (request.launchApp) {
    if (chrome.app.window.get("sonarDesktopCapture")) {
      sendResponse('A study is already in progress.');
      this.eventBus.trigger('alertWindow');
    } else {
      this.onLaunched(request.launchApp);
      sendResponse(true);
    }
  }
}

BackgroundController.prototype.update = function(sendResponse) {
  // auto-update if no study in progress
  // https://developer.chrome.com/extensions/runtime#method-requestUpdateCheck
  chrome.runtime.requestUpdateCheck(function(status, details) {
    if (status == 'update_available') {
      if (!chrome.app.window.get("sonarDesktopCapture")) {
        sendResponse(true);
        chrome.runtime.reload();
      } else {
        sendResponse(false);
      }
    } else {
      sendResponse(true);
    }
  });
}

BackgroundController.prototype.onLaunched = function(launchApp) {
  if (!launchApp
    || !launchApp.scenarioResultHashId
    || !launchApp.screen) {
    return;
  }

  this.model.init(launchApp.scenarioResultHashId);

  currentWindow = chrome.app.window.create('popup.html', {
    id: "sonarDesktopCapture",
    frame: 'none',
    focused: true,
    state: 'normal',
    hidden: true,
    resizable: false,
    alwaysOnTop: true
  }, $.proxy(this.onCreatedWindow, this, launchApp));
}

BackgroundController.prototype.onCreatedWindow = function(launchApp, createdWindow) {
  this.eventBus.trigger('scenarioLoad', {
    'flowType': launchApp.flowType || 'easyFlow',
    'scenario': launchApp.scenario,
    'scenarioResultHashId': launchApp.scenarioResultHashId
  });
};

BackgroundController.prototype.testLaunchEasy = function() {
  var testData = this.testData();
  testData.flowType = 'easyFlow';
  this.onLaunched(testData);
};

BackgroundController.prototype.testLaunchExpert = function() {
  var testData = this.testData();
  testData.scenario = null;
  testData.flowType = 'expertFlow';
  this.onLaunched(testData);
};

BackgroundController.prototype.testData = function() {
  return {
    scenario: {
      "hashid":"2mP50myq",
      "description":"This a test of urls",
      "steps":[
        {
          "hashid":"8jjenddw",
          "description":"Bacon ipsum dolor amet pig consectetur irure ham, prosciutto tenderloin deserunt dolor. Elit strip steak pancetta, rump commodo andouille excepteur ut fugiat pork flank tongue tri-tip. Pork ipsum ut, cupim brisket turkey pork loin t-bone et cow ground round ribeye. Aliqua eiusmod enim doner brisket frankfurter eu kielbasa pork loin sunt officia bacon. Leberkas ball tip flank cupidatat pork chop meatloaf. Shankle enim laborum pariatur brisket irure.",
          "url":"www.example.com"
        },
        {
          "hashid":"V3gW0ood",
          "description":"Please go to the site and log in.",
          "url":"http://www.example.com/"
        },
        {
          "hashid":"8D0ewPP2",
          "description":"Click on feature 1 (2nd from the right on the top nav) and do action 1. Any feedback so far? (remember to speak out loud)",
          "url":"https://example.com"
        },
        {
          "hashid":"V57O4oo5",
          "description":"Cillum tail ipsum laborum, esse labore tongue aliqua turkey kielbasa pork sint pancetta lorem. Alcatra ribeye ground round sed deserunt biltong minim meatball. Ad meatloaf chicken fugiat, biltong salami aliqua leberkas. Eiusmod veniam elit proident deserunt. Bacon picanha commodo doner labore pork chop, occaecat exercitation filet mignon biltong bresaola deserunt veniam. Nulla pariatur kevin, doner quis laboris veniam non. Sed ham alcatra hamburger, veniam turducken est beef ribs bresaola short loin aliqua filet mignon beef eu.",
          "url":""
        }
      ]
    },
    scenarioResultHashId: "YXjbMRzg",
    screen: {
      availHeight: 874,
      availLeft: 0,
      availTop: 22,
      availWidth: 1440
    }
  };
};

BackgroundController.prototype.onStarted = function(event, eventData) {
  this.model.startStudy();
  this.model.newResultStep(eventData.scenarioResultHashId, eventData.scenarioStepHashId);

  this.ajaxer.notifyStart(eventData.scenarioResultHashId);
}

BackgroundController.prototype.onNexted = function(event, eventData) {
  this.model.finishResultStep();
  this.model.newResultStep(eventData.scenarioResultHashId, eventData.scenarioStepHashId);
}

BackgroundController.prototype.onFinished = function(event, eventData) {
  this.model.finishResultStep();

  this.ajaxer.notifyFinish(eventData.scenarioResultHashId);
}

BackgroundController.prototype.onAborted = function(event, eventData) {
  if (!this.model.getCurrentResultStep()) {
    // study was never even started
    return;
  }

  this.ajaxer.notifyAbort(eventData.scenarioResultHashId);
}

BackgroundController.prototype.onDelighted = function() {
  this.model.addDelighted();
}

BackgroundController.prototype.onConfused = function() {
  this.model.addConfused();
}

BackgroundController.prototype.onNoted = function(event, eventData) {
  this.model.addNote(eventData.note);
};

BackgroundController.prototype.onTitled = function(event, eventData) {
  this.ajaxer.saveTitle(eventData.title, eventData.scenarioResultHashId);
};

BackgroundController.prototype.onMuteRecording = function() {
  this.model.startMute();
};

BackgroundController.prototype.onUnmuteRecording = function() {
  this.model.endMute();
};
