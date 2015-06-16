function PopupView(eventBus, model, config) {
  this.eventBus = eventBus;
  this.model = model;

  this.baseUrl = config.baseUrl;
  this.$divStart = config.divStart;
  this.$divStep = config.divStep;
  this.$divFinish = config.divFinish;
  this.$divRecording = config.divRecording;
  this.$divDescription = config.divDescription;
  this.$divStepOfText = config.divStepOfText;
  this.$ahrefUrl = config.ahrefUrl;
  this.$titleBar = config.titleBar;
  this.$content = config.content;
  this.$btnQuestion = config.btnQuestion;
  this.$btnMinimize = config.btnMinimize;
  this.$btnAbort = config.btnAbort;
  this.$btnFinish = config.btnFinish;
  this.$btnStart = config.btnStart;
  this.$btnNext = config.btnNext;
  this.$btnDelighted = config.btnDelighted;
  this.$btnConfused = config.btnConfused;
  this.$micCheckBars = config.micCheckBars;
  this.$micLevelBars = config.micLevelBars;

  this.init();
  this.initHandlers();
}

PopupView.prototype.init = function() {
  this.audioVisualization = new AudioVisualization(-60, -20);
  this.audioVisualization.start();

  this.$divStart.show();
  this.$divStep.hide();
  this.$divFinish.hide();

  this.minimizeHeight = this.$titleBar.height();
  this.resizeWindowToFit();
}

PopupView.prototype.initHandlers = function() {
  this.on('click', this.$btnQuestion, this.openHelp);
  this.on('click', this.$btnMinimize, this.toggleMinimize);
  this.on('click', this.$btnAbort, this.abort);

  this.on('click', this.$btnStart, this.start);
  this.on('click', this.$btnNext, this.next);
  this.on('click', this.$btnDelighted, this.delighted);
  this.on('click', this.$btnConfused, this.confused);
  this.on('click', this.$btnFinish, this.finish);

  this.eventBus.on('recordingStarted', this.onRecordingStarted, this);
  this.eventBus.on('recordingStopped', this.onRecordingStopped, this);
  this.eventBus.on('recordingFailure', this.onRecordingFailure, this);
}

PopupView.prototype.resizeWindowToFit = function() {
  chrome.app.window.current().outerBounds.height = this.$content.outerHeight(true);
}

PopupView.prototype.openHelp = function() {
  var scenarioHashId = this.model.getUserScenario().hashid;
  window.open(this.baseUrl + 'studies/' + scenarioHashId + '/help');
}

PopupView.prototype.isMinimized = function() {
  return this.$titleBar.hasClass('minimized');
}

PopupView.prototype.restore = function() {
  this.$titleBar.removeClass('minimized');
  chrome.app.window.current().outerBounds.height = this.$content.outerHeight(true);
}

PopupView.prototype.minimize = function() {
  this.$titleBar.addClass('minimized');
  chrome.app.window.current().outerBounds.height = this.minimizeHeight;
}

PopupView.prototype.toggleMinimize = function() {
  if (this.isMinimized()) {
    this.restore();
  } else {
    this.minimize();
  }
  return false;
}

PopupView.prototype.finish = function() {
  window.close();
}

PopupView.prototype.abort = function() {
  this.eventBus.trigger('abort', {
    'scenarioResultHashId': this.model.getScenarioResultHashId()
  });
  window.close();
}

PopupView.prototype.start = function() {
  this.model.start();

  this.eventBus.trigger('start', {
    'scenarioResultHashId': this.model.getScenarioResultHashId()
  });

  this.eventBus.trigger('start');
}

PopupView.prototype.next = function() {
  this.$btnNext.fadeOut().fadeIn();

  if (this.model.isLastStep()) {
    this.$divStart.hide();
    this.$divStart.addClass('started');

    this.$divStep.hide();
    this.$divFinish.fadeIn('slow');
    this.resizeWindowToFit();
    chrome.app.window.current().setAlwaysOnTop(false);

    this.eventBus.trigger('finish', {
      'scenarioResultHashId': this.model.getScenarioResultHashId()
    });
  } else {
    this.$divStart.hide();
    this.$divStart.addClass('started');

    this.model.nextStep();

    this.$divStepOfText.html('Step ' + this.model.getCurrentStepDisplay() + ' of ' + this.model.getTotalStepDisplay() + ':');
    this.$divDescription.html(this.model.getCurrentDescription());
    this.populateUrl(this.model.getCurrentUrl());
    this.$content.hide().fadeIn('slow');
    this.resizeWindowToFit();

    this.eventBus.trigger('next', {
      'scenarioResultHashId': this.model.getScenarioResultHashId(),
      'resultStepHashId': this.model.getResultStepHashId()
    });
  }

}

PopupView.prototype.delighted = function() {
  this.eventBus.trigger('delighted');
  this.$btnDelighted.fadeOut().fadeIn();
}

PopupView.prototype.confused = function() {
  this.eventBus.trigger('confused');
  this.$btnConfused.fadeOut().fadeIn();
}

PopupView.prototype.populateUrl = function(url) {
  if (!url) {
    this.$ahrefUrl.html('');
    return;
  }

  var targetUrl = url.indexOf('http') == 0 ? url : 'http://' + url;
  var displayUrl = 'Go to ' +
    ( url.indexOf('https://') == 0 ? url.substring('https://'.length)
    : url.indexOf('http://') == 0 ? url.substring('http://'.length)
    : url );

  if (displayUrl.indexOf('/') > 0) {
    displayUrl = displayUrl.substring(0, displayUrl.indexOf('/'));
  }

  this.$ahrefUrl.attr('href', targetUrl);
  this.$ahrefUrl.html(displayUrl);
}

PopupView.prototype.onRecordingStarted = function() {
  this.$divStep.show();
  this.onScenarioNexted();
  this.$divRecording.removeClass('off').addClass('on');

  this.startMicrophoneResponse(this.$micLevelBars);
}

PopupView.prototype.onRecordingStopped = function() {
  this.$divRecording.removeClass('on').addClass('off');
  this.stopMicrophoneResponse();
}

PopupView.prototype.onRecordingFailure = function() {
  this.$divRecording.removeClass('on').addClass('off');
  this.stopMicrophoneResponse();
}

PopupView.prototype.startMicrophoneResponse = function($targets) {
  this.stopMicrophoneResponse();

  var responseFunction = function() {
    var amplitudeFiveScale = Math.round(this.audioVisualization.getAmplitude() / 255.0 * 5.0);
    //console.log(new Date().getSeconds() + '.' + new Date().getMilliseconds() + ':' + amplitudeFiveScale);
    $targets.removeClass('on').slice(0, amplitudeFiveScale).addClass('on');
  }

  this.responseLoop = setInterval($.proxy(responseFunction, this), 100);
}

PopupView.prototype.stopMicrophoneResponse = function() {
  clearInterval(this.responseLoop);
}
