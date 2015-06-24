function PopupView(eventBus, model, config) {
  this.eventBus = eventBus;
  this.model = model;

  this.baseUrl = config.baseUrl;
  this.$divInstructions = config.divInstructions;
  this.$divSelectScreen = config.divSelectScreen;
  this.$divStart = config.divStart;
  this.$divStep = config.divStep;
  this.$divFinish = config.divFinish;
  this.$divAbort = config.divAbort;
  this.$divAborted = config.divAborted;

  this.$divDescription = config.divDescription;
  this.$divStepOfText = config.divStepOfText;
  this.$ahrefUrl = config.ahrefUrl;
  this.$titleBar = config.titleBar;
  this.$content = config.content;

  this.$btnAbort = config.btnAbort;
  this.$btnAbortYes = config.btnAbortYes;
  this.$btnAbortNo = config.btnAbortNo;
  this.$btnAbortConfirm = config.btnAbortConfirm;

  this.$btnQuestion = config.btnQuestion;
  this.$btnStart = config.btnStart;
  this.$btnFirstStep = config.btnFirstStep;
  this.$btnNext = config.btnNext;
  this.$btnFinish = config.btnFinish;
  this.$btnDelighted = config.btnDelighted;
  this.$btnConfused = config.btnConfused;

  this.$ctnTooltips = config.ctnTooltips;

  this.$progressBar = config.progressBar;

  this.centerWidth = config.centerWidth;
  this.centerHeight = config.centerHeight;
  this.centerMinWidth = config.centerMinWidth;
  this.centerMinHeight = config.centerMinHeight;

  this.cornerMargin = config.cornerMargin;
  this.cornerWidth = config.cornerWidth;
  this.cornerHeight = config.cornerHeight;
  this.cornerMinWidth = config.cornerMinWidth;
  this.cornerMinHeight = config.cornerMinHeight;

  this.init();
  this.initHandlers();
}

PopupView.prototype.init = function() {
}

PopupView.prototype.initHandlers = function() {
  this.on('click', this.$btnQuestion, this.openHelp);
  this.on('click', this.$btnAbort, this.showAbort);
  this.on('click', this.$btnAbortYes, this.abort);
  this.on('click', this.$btnAbortNo, this.hideAbort);
  this.on('click', this.$btnAbortConfirm, this.abort);

  this.on('click', this.$btnStart, this.requestRecording);
  this.on('click', this.$btnFirstStep, this.firstStep);

  this.on('click', this.$btnNext, this.next);
  this.on('click', this.$btnDelighted, this.delighted);
  this.on('click', this.$btnConfused, this.confused);
  this.on('click', this.$btnFinish, this.finish);

  this.on('mouseenter', this.$ctnTooltips, this.showTooltips);
  this.on('mouseleave', this.$ctnTooltips, this.hideTooltips);
  this.on('click', this.$ctnTooltips, this.clickTooltips);

  this.eventBus.on('scenarioLoad', this.showInstructions, this);

  this.eventBus.on('recordingStarted', this.onRecordingStarted, this);
  this.eventBus.on('recordingStopped', this.onRecordingStopped, this);
  this.eventBus.on('recordingFailure', this.onRecordingFailure, this);
  this.eventBus.on('recordingHeard', this.onRecordingHeard, this);
  this.eventBus.on('uploadProgress', this.onUploadProgress, this);
  this.eventBus.on('uploadFinish', this.onUploadFinish, this);
}

PopupView.prototype.on = function(eventType, element, clickHandler) {
  element.on(eventType, $.proxy(clickHandler, this));
}

PopupView.prototype.showInstructions = function(event, eventData) {
  this.$divSelectScreen.hide();
  this.$divStart.hide();
  this.$divStep.hide();
  this.$divFinish.hide();

  var windowScreen = window.screen;
  if (eventData && eventData.scenario && eventData.scenario.screen) {
    windowScreen = eventData.scenario.screen;
  }

  chrome.app.window.current().outerBounds.setMinimumSize(this.centerWidth, this.centerHeight);
  chrome.app.window.current().outerBounds.setMaximumSize(this.centerWidth, this.centerHeight);
  chrome.app.window.current().outerBounds.setPosition(
    windowScreen.availLeft + Math.round((windowScreen.availWidth - this.centerWidth) / 2),
    windowScreen.availTop + Math.round((windowScreen.availHeight - this.centerHeight) / 2)
  );

  this.$divInstructions.show();
  chrome.app.window.current().show();
}

PopupView.prototype.showSelectScreen = function() {
  this.$divInstructions.hide();
  this.showStaticCornerWindow();
  this.$divSelectScreen.show();
}

PopupView.prototype.showStart = function() {
  this.$divSelectScreen.hide();

  chrome.app.window.current().setAlwaysOnTop(true);
  this.showStaticCornerWindow();

  this.$divStart.show();
}

PopupView.prototype.showStaticCornerWindow = function() {
  chrome.app.window.current().outerBounds.setMinimumSize(this.cornerWidth, this.cornerHeight);
  chrome.app.window.current().outerBounds.setMaximumSize(this.cornerWidth, this.cornerHeight);
  chrome.app.window.current().outerBounds.setPosition(
    screen.availLeft + screen.availWidth - this.cornerWidth - this.cornerMargin,
    screen.availTop + 0
  );
}

PopupView.prototype.showStep = function() {
  this.$divStart.hide();

  chrome.app.window.current().outerBounds.setMinimumSize(this.cornerMinWidth, this.cornerMinHeight);
  chrome.app.window.current().outerBounds.setMaximumSize(null, null)
  chrome.app.window.current().outerBounds.setSize(this.cornerWidth, this.cornerHeight);
  chrome.app.window.current().outerBounds.setPosition(
    screen.availLeft + screen.availWidth - this.cornerWidth - this.cornerMargin,
    screen.availTop + 0
  );

  this.$divStep.show();
}

PopupView.prototype.showFinish = function() {
  chrome.app.window.current().setAlwaysOnTop(false);
  this.$divStep.hide();
  this.showStaticCornerWindow();
  this.$divFinish.fadeIn('slow');
}

PopupView.prototype.showAbort = function() {
  this.$divAbort.css({display:'flex'});
}

PopupView.prototype.hideAbort = function() {
  this.$divAbort.css({display:'none'});
}

PopupView.prototype.showAborted = function() {
  this.$divAborted.css({display:'flex'});
}

PopupView.prototype.openHelp = function() {
  var scenarioHashId = this.model.getUserScenario().hashid;
  window.open(this.baseUrl + 'studies/' + scenarioHashId + '/help');
}

PopupView.prototype.showTooltips = function(event) {
  var thisEl = $(event.currentTarget).closest('.ctn-tooltip');

  // don't interrupt previous clickTooltips
  if (thisEl.find('.tooltip-click').queue().length) {
    return;
  }

  thisEl.addClass('shadow-hover');
  thisEl.find('.tooltip').css({opacity:0});
  thisEl.find('.tooltip-hover').css({opacity:1});
  thisEl.closest('section').find('.shadow').show();
}

PopupView.prototype.hideTooltips = function(event) {
  var thisEl = $(event.currentTarget).closest('.ctn-tooltip');

  // don't interrupt previous clickTooltips
  if (thisEl.find('.tooltip-click').queue().length) {
    return;
  }

  thisEl.removeClass('shadow-hover');
  thisEl.find('.tooltip').css({opacity:0});
  thisEl.find('.tooltip-base').css({opacity:1});
  thisEl.closest('section').find('.shadow').hide();
}

PopupView.prototype.clickTooltips = function(event) {
  var thisEl = $(event.currentTarget).closest('.ctn-tooltip');

  // don't interrupt previous clickTooltips
  if (thisEl.find('.tooltip-click').queue().length) {
    return;
  }

  thisEl.addClass('shadow-hover');
  thisEl.find('.tooltip').css({opacity:0});
  thisEl.find('.tooltip-click')
    .css({opacity:1})
    .delay(1000)
    .animate({opacity:0}, function(){
      thisEl.find('.tooltip-base').css('opacity', 1);
    });
  thisEl.closest('section').find('.shadow')
    .addClass('shadow-dark')
    .show()
    .delay(1000)
    .fadeOut(function() {
      $(this).removeClass('shadow-dark');
      thisEl.removeClass('shadow-hover');
    });
}

PopupView.prototype.requestRecording = function() {
  if (this.$btnStart.hasClass('disabled')) {
    return;
  }

  // asks for recording and awaits recording success to actually start
  this.eventBus.trigger('requestRecording');

  this.showSelectScreen();
}

PopupView.prototype.start = function() {
  this.showStart();

  // we start recording and act as if the first step has already started
  // even though the first step is not yet visualy on the screen
  // until they click this.$btnFirstStep
  this.model.firstStep();

  this.eventBus.trigger('start', {
    'scenarioResultHashId': this.model.getScenarioResultHashId(),
    'scenarioStepHashId': this.model.getScenarioStepHashId()
  });
}

PopupView.prototype.firstStep = function() {
  this.showStep();

  this.$divStepOfText.html('Step ' + this.model.getCurrentStepDisplay() + ' of ' + this.model.getTotalStepDisplay() + ':');
  this.$divDescription.html(this.model.getCurrentDescription());
  this.populateUrl(this.model.getCurrentUrl());
  this.$content.hide().fadeIn('slow');
}

PopupView.prototype.next = function() {
  if (this.model.isLastStep()) {
    this.eventBus.trigger('finish', {
      'scenarioResultHashId': this.model.getScenarioResultHashId()
    });

    this.showFinish();
  } else {
    this.model.nextStep();

    this.eventBus.trigger('next', {
      'scenarioResultHashId': this.model.getScenarioResultHashId(),
      'scenarioStepHashId': this.model.getScenarioStepHashId()
    });

    this.$content.hide();

    this.$divStepOfText.html('Step ' + this.model.getCurrentStepDisplay() + ' of ' + this.model.getTotalStepDisplay() + ':');
    this.$divDescription.html(this.model.getCurrentDescription());
    this.populateUrl(this.model.getCurrentUrl());

    if (this.model.isLastStep()) {
      this.$btnNext.html('<span>Finish</span>');
    }

    this.$content.fadeIn('slow');
  }

}

PopupView.prototype.delighted = function() {
  this.eventBus.trigger('delighted');
}

PopupView.prototype.confused = function() {
  this.eventBus.trigger('confused');
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

PopupView.prototype.populateUrl = function(url) {
  if (!url) {
    this.$ahrefUrl.html('');
    return;
  }

  var targetUrl = url.indexOf('http') == 0 ? url : 'http://' + url;
  var displayUrl =
    ( url.indexOf('https://') == 0 ? url.substring('https://'.length)
    : url.indexOf('http://') == 0 ? url.substring('http://'.length)
    : url );

  if (displayUrl.indexOf('/') > 0) {
    displayUrl = displayUrl.substring(0, displayUrl.indexOf('/'));
  }

  this.$ahrefUrl.attr('href', targetUrl);
  this.$ahrefUrl.html(displayUrl);
  window.open(targetUrl);
}

PopupView.prototype.onRecordingStarted = function() {
  this.start();
}

PopupView.prototype.onRecordingStopped = function() {

}

PopupView.prototype.onRecordingFailure = function() {
  if (this.model.currentIndex >= 0) {
    this.showAborted();
  } else {
    this.showInstructions();
  }
}

PopupView.prototype.onRecordingHeard = function() {
  this.$btnStart.removeClass('disabled');
}

PopupView.prototype.onUploadProgress = function(event, eventData) {
  this.$progressBar.width(Math.min(Math.max(eventData.percentage, 5), 100) + '%');
}

PopupView.prototype.onUploadFinish = function() {
  this.$progressBar.width('100%');
  this.$divFinish.delay(1000).fadeOut(1000, function(){
    window.close();
  });
}
