function PopupView(eventBus, model, config) {
  this.eventBus = eventBus;
  this.model = model;

  this.baseUrl = config.baseUrl;
  this.$divInstructions = config.divInstructions;
  this.$divSelectScreen = config.divSelectScreen;
  this.$divStart = config.divStart;
  this.$divStep = config.divStep;
  this.$divFinish = config.divFinish;
  this.$divRecording = config.divRecording;
  this.$recordingTextTime = config.recordingTextTime;
  this.$divDescription = config.divDescription;
  this.$divStepOfText = config.divStepOfText;
  this.$ahrefUrl = config.ahrefUrl;
  this.$titleBar = config.titleBar;
  this.$content = config.content;
  this.$btnAbort = config.btnAbort;
  this.$btnQuestion = config.btnQuestion;
  this.$btnStart = config.btnStart;
  this.$btnFirstStep = config.btnFirstStep;
  this.$btnNext = config.btnNext;
  this.$btnFinish = config.btnFinish;
  this.$btnDelighted = config.btnDelighted;
  this.$btnConfused = config.btnConfused;

  this.$ctnTooltips = config.ctnTooltips;

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
  this.on('click', this.$btnAbort, this.abort);

  this.on('click', this.$btnStart, this.requestRecording);
  this.on('click', this.$btnFirstStep, this.firstStep);

  this.on('click', this.$btnNext, this.next);
  this.on('click', this.$btnDelighted, this.delighted);
  this.on('click', this.$btnConfused, this.confused);
  this.on('click', this.$btnFinish, this.finish);

  this.on('mouseenter', this.$ctnTooltips, this.showTooltips);
  this.on('mouseleave', this.$ctnTooltips, this.hideTooltips);
  this.on('click', this.$ctnTooltips, this.clickTooltips);

  this.eventBus.on('recordingStarted', this.onRecordingStarted, this);
  this.eventBus.on('recordingStopped', this.onRecordingStopped, this);
  this.eventBus.on('recordingFailure', this.onRecordingFailure, this);
}

PopupView.prototype.on = function(eventType, element, clickHandler) {
  element.on(eventType, $.proxy(clickHandler, this));
}

PopupView.prototype.showInstructions = function() {
  this.$divInstructions.show();
  this.$divSelectScreen.hide();
  this.$divStart.hide();
  this.$divStep.hide();
  this.$divFinish.hide();

  chrome.app.window.current().outerBounds.setMinimumSize(this.centerWidth, this.centerHeight);
  chrome.app.window.current().outerBounds.setMaximumSize(this.centerWidth, this.centerHeight);
  chrome.app.window.current().outerBounds.setPosition(
    Math.round((screen.availWidth - this.centerWidth) / 2),
    Math.round((screen.availHeight - this.centerHeight) / 2)
  );
  chrome.app.window.current().show();
}

PopupView.prototype.showSelectScreen = function() {
  this.$divInstructions.hide();
  this.showStaticCornerWindow();
  this.$divSelectScreen.show();
}

PopupView.prototype.showStart = function() {
  this.$divSelectScreen.hide();
  this.showStaticCornerWindow();
  this.$divStart.show();
}

PopupView.prototype.showStaticCornerWindow = function() {
  chrome.app.window.current().outerBounds.setMinimumSize(this.cornerWidth, this.cornerHeight);
  chrome.app.window.current().outerBounds.setMaximumSize(this.cornerWidth, this.cornerHeight);
  chrome.app.window.current().outerBounds.setPosition(
    screen.availWidth - this.cornerWidth - this.cornerMargin,
    0
  );
}

PopupView.prototype.showStep = function() {
  this.$divStart.hide();

  chrome.app.window.current().outerBounds.setMinimumSize(this.cornerMinWidth, this.cornerMinHeight);
  chrome.app.window.current().outerBounds.setMaximumSize(null, null)
  chrome.app.window.current().outerBounds.setSize(this.cornerWidth, this.cornerHeight);
  chrome.app.window.current().outerBounds.setPosition(
    screen.availWidth - this.cornerWidth - this.cornerMargin,
    0
  );

  this.$divStep.show();
}

PopupView.prototype.showFinish = function() {
  chrome.app.window.current().setAlwaysOnTop(false);
  this.$divStep.hide();
  this.$divFinish.fadeIn('slow');
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
  this.start();

  this.$recordingTextTime.html('00:00');
  var timeUpdateFunction = function() {

    var timeText = this.$recordingTextTime.html();
    var minsText = parseInt(timeText.split(":")[0]);
    var secsText = parseInt(timeText.split(":")[1]);

    secsText += 1;
    if (secsText == 60) {
      minsText += 1;
      secsText = 0;
    }
    this.$recordingTextTime.html(
      ('00' + minsText).slice(-2) + ':' + ('00' + secsText).slice(-2)
    );
  }
  this.recordingTextTimeUpdate = setInterval($.proxy(timeUpdateFunction, this), 1000);

  this.$divRecording.removeClass('off').addClass('on');
}

PopupView.prototype.onRecordingStopped = function() {
  this.$divRecording.removeClass('on').addClass('off');
  clearInterval(this.recordingTextTimeUpdate);
}

PopupView.prototype.onRecordingFailure = function() {
  this.$divRecording.removeClass('on').addClass('off');

  if (this.model.currentIndex >= 0) {
    this.abort();
  } else {

  }
}
