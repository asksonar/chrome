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
  this.startMicrophoneResponse(this.$micCheckBars);
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

  this.on('scenarioStarted', this.eventBus, this.onScenarioStarted);
  this.on('scenarioNexted', this.eventBus, this.onScenarioNexted);
  this.on('scenarioFinished', this.eventBus, this.onScenarioFinished);

  this.on('videoRecordingStarted', this.eventBus, this.onRecordingStarted);
  this.on('videoRecordingStopped', this.eventBus, this.onRecordingStopped);
  this.on('audioRecordingStopped', this.eventBus, this.onRecordingStopped);
}

PopupView.prototype.on = function(eventType, element, clickHandler) {
  element.on(eventType, $.proxy(clickHandler, this));
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
  this.eventBus.trigger('abort');
  window.close();
}

PopupView.prototype.start = function() {
  this.eventBus.trigger('start');
}

PopupView.prototype.next = function() {
  if (this.model.isLastStep()) {
    this.eventBus.trigger('finish');
  } else {
    this.eventBus.trigger('next');
  }
  this.$btnNext.fadeOut().fadeIn();
}

PopupView.prototype.delighted = function() {
  this.eventBus.trigger('delighted');
  this.$btnDelighted.fadeOut().fadeIn();
}

PopupView.prototype.confused = function() {
  this.eventBus.trigger('confused');
  this.$btnConfused.fadeOut().fadeIn();
}

PopupView.prototype.onScenarioStarted = function() {
  this.$divStart.hide();
  this.$divStart.addClass('started');
}

PopupView.prototype.onScenarioNexted = function() {
  this.$divStepOfText.html('Step ' + (this.model.getCurrentIndex() + 1) + ' of ' + this.model.getTotalIndex() + ':');
  this.$divDescription.html(this.model.getCurrentDescription());
  this.populateUrl(this.model.getCurrentUrl());
  this.$content.hide().fadeIn('slow');
  this.resizeWindowToFit();
}

PopupView.prototype.onScenarioFinished = function() {
  this.$divStart.hide();
  this.$divStep.hide();
  this.$divFinish.fadeIn('slow');
  this.resizeWindowToFit();
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
  console.log('Recording has stopped.');
  this.abort();
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
