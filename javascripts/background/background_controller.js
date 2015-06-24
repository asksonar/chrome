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

  chrome.runtime.onMessageExternal.addListener($.proxy(this.onMessaged, this));
  chrome.app.runtime.onLaunched.addListener($.proxy(this.onLaunched, this));
}

BackgroundController.prototype.onMessaged = function(request, sender, sendResponse) {
  if (request === 'isInstalledApp?') {
    sendResponse(true);
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

BackgroundController.prototype.onLaunched = function(scenario) {
  if (scenario && scenario.source) {
    // checking for Object {isKioskSession: false, source: "reload"}
    // or Object {isKioskSession: false, source: "extensions_page"}
    return;
  }

  this.model.init();

  currentWindow = chrome.app.window.create('popup.html', {
    id: "sonarDesktopCapture",
    frame: 'none',
    focused: true,
    state: 'normal',
    hidden: true
  }, $.proxy(this.onCreatedWindow, this, scenario));
}

BackgroundController.prototype.onCreatedWindow = function(scenario, createdWindow) {
  this.eventBus.trigger('scenarioLoad', {
    'scenario': scenario
  });
}

BackgroundController.prototype.testLaunch = function() {
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

  this.onLaunched(testData);
}

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
