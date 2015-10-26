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
  this.$divAlert = config.divAlert;

  this.$divTitle = config.divTitle;
  this.$divDescription = config.divDescription;
  this.$divStepOfText = config.divStepOfText;
  this.$divCtnDescription = config.divCtnDescription;
  this.$ahrefUrl = config.ahrefUrl;
  this.$titleBar = config.titleBar;
  this.$content = config.content;

  this.$btnAbort = config.btnAbort;
  this.$btnAbortYes = config.btnAbortYes;
  this.$btnAbortNo = config.btnAbortNo;
  this.$btnAbortConfirm = config.btnAbortConfirm;

  this.$btnQuestion = config.btnQuestion;
  this.$btnStart = config.btnStart;
  this.$divAlertStart = config.divAlertStart;
  this.$btnFirstStep = config.btnFirstStep;
  this.$btnNext = config.btnNext;
  this.$btnFinish = config.btnFinish;
  this.$btnDelighted = config.btnDelighted;
  this.$btnConfused = config.btnConfused;

  this.$btnShowLess = config.btnShowLess;
  this.$btnShowMore = config.btnShowMore;

  this.$ctnTooltips = config.ctnTooltips;

  this.$progressBar = config.progressBar;
  this.$btnProgressPause = config.btnProgressPause;
  this.$btnProgressPlay = config.btnProgressPlay;

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
  chrome.app.window.current().setAlwaysOnTop(true);
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

  this.on('click', this.$btnShowLess, this.showLess);
  this.on('click', this.$btnShowMore, this.showMore);

  this.on('mouseenter', this.$ctnTooltips, this.showTooltips);
  this.on('mouseleave', this.$ctnTooltips, this.hideTooltips);
  this.on('click', this.$ctnTooltips, this.clickTooltips);

  this.on('click', this.$btnProgressPause, this.pauseUpload);
  this.on('click', this.$btnProgressPlay, this.resumeUpload);

  this.eventBus.on('scenarioLoad', this.showInstructions, this);
  this.eventBus.on('alertWindow', this.showAlert, this);

  this.eventBus.on('recordingStarted', this.onRecordingStarted, this);
  this.eventBus.on('recordingStopped', this.onRecordingStopped, this);
  this.eventBus.on('recordingFailure', this.onRecordingFailure, this);
  this.eventBus.on('recordingHeard', this.onRecordingHeard, this);
  this.eventBus.on('uploadProgress', this.onUploadProgress, this);
  this.eventBus.on('uploadFinish', this.onUploadFinish, this);

}

PopupView.prototype.showLess = function() {
  this.$divStep.removeClass('expanded').addClass('collapsed');
  this.resizeStepDescription();
};

PopupView.prototype.showMore = function() {
  this.$divStep.removeClass('collapsed').addClass('expanded');
  this.resizeStepDescription();
};

PopupView.prototype.on = function(eventType, element, clickHandler) {
  element.on(eventType, $.proxy(clickHandler, this));
}

PopupView.prototype.showAlert = function() {
  var currentAlwaysOnTop = chrome.app.window.current().isAlwaysOnTop();
  chrome.app.window.current().setAlwaysOnTop(true);
  chrome.app.window.current().setAlwaysOnTop(currentAlwaysOnTop);
  this.$divAlert.fadeIn().fadeOut().fadeIn().fadeOut();
}

PopupView.prototype.resize = function(width, height) {
  chrome.app.window.current().outerBounds.width = width;
  chrome.app.window.current().outerBounds.height = height;
}

PopupView.prototype.resizeLarge = function() {
  this.resize(this.centerWidth, this.centerHeight);
};

PopupView.prototype.resizeSmall = function() {
  this.resize(this.cornerWidth, this.cornerHeight);
};

PopupView.prototype.moveCenter = function(width, height, duration) {
  var windowScreen = window.screen;

  this.move(
    windowScreen.availLeft + Math.round((windowScreen.availWidth - width) / 2),
    windowScreen.availTop + Math.round((windowScreen.availHeight - height) / 2),
    duration
  );
};

PopupView.prototype.moveCenterTop = function(width, height, duration) {
  var windowScreen = window.screen;

  this.move(
    windowScreen.availLeft + Math.round((windowScreen.availWidth - width) / 2),
    windowScreen.availTop + 0,
    duration
  );
};

PopupView.prototype.move = function(targetLeft, targetTop, duration) {
  if (duration === 'fast') {
    duration = 200;
  } else if (duration === 'slow') {
    duration = 600;
  } else {
    duration = parseInt(duration);
    if (duration === 0) {
      duration = 0;
    } else {
      duration = duration || 400;
    }
  }

  var startLeft = chrome.app.window.current().outerBounds.left;
  var startTop = chrome.app.window.current().outerBounds.top;

  var startTime;

  function step(timestamp) {
    if (!startTime) {
      startTime = timestamp;
    }
    var progress = timestamp - startTime;

    var newLeft = Math.round((targetLeft - startLeft) * (progress / duration) + startLeft);
    var newTop = Math.round((targetTop - startTop) * (progress / duration) + startTop);

    if (progress < duration) {
      chrome.app.window.current().outerBounds.setPosition(newLeft, newTop);
      window.requestAnimationFrame(step);
    } else {
      chrome.app.window.current().outerBounds.setPosition(targetLeft, targetTop);
    }
  }

  if (duration === 0) {
    chrome.app.window.current().outerBounds.setPosition(targetLeft, targetTop);
  } else {
    window.requestAnimationFrame(step);
  }
};

PopupView.prototype.moveCenterResizeLarge = function(duration) {
  this.resizeLarge();
  this.moveCenter(this.centerWidth, this.centerHeight, duration);
};

PopupView.prototype.moveCenterTopResizeSmall = function(duration) {
  this.resizeSmall();
  this.moveCenterTop(this.cornerWidth, this.cornerHeight, duration);
};

PopupView.prototype.showInstructions = function(event, eventData) {
  this.$divSelectScreen.hide();
  this.$divStart.hide();
  window.clearInterval(this.highlightStartInterval);
  this.$divStep.hide();
  this.$divFinish.hide();

  var windowScreen = window.screen;
  if (eventData && eventData.screen) {
    windowScreen = eventData.screen;
  }

  this.moveCenterResizeLarge(0);

  this.$divInstructions.show();
  chrome.app.window.current().show();
};

PopupView.prototype.showSelectScreen = function() {
  this.$divInstructions.hide();
  this.resizeSmall();
  this.move(
    screen.availLeft + screen.availWidth - this.cornerWidth,
    screen.availTop + 0,
    0
  );
  this.$divSelectScreen.show();
}

PopupView.prototype.showStart = function() {
  this.$divSelectScreen.hide();

  this.moveCenterResizeLarge(0);

  this.$divStart.show();
  this.highlightStartInterval = window.setInterval($.proxy(this.highlightStart, this), 7 * 1000);
}

PopupView.prototype.highlightStart = function() {
  var left = this.$btnFirstStep.offset().left;
  var top = this.$btnFirstStep.offset().top;
  var width = this.$btnFirstStep.outerWidth();
  var height = this.$btnFirstStep.outerHeight();

  var padding = 5; /* defined in css */
  var topOffset = 32; /* height of the titlebar which is not include in position relative parent */

  this.$divAlertStart.css({
    left: left - padding,
    top: top - padding - topOffset,
    width: width,
    height: height
  }).fadeIn().fadeOut().fadeIn().fadeOut();
}

PopupView.prototype.showStep = function() {
  this.$divStart.hide();
  window.clearInterval(this.highlightStartInterval);

  this.$divStep.show();
}

PopupView.prototype.showFinish = function() {
  this.resizeSmall();
  chrome.app.window.current().setAlwaysOnTop(false);
  this.$divStep.hide();
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
  this.$content.width(this.cornerWidth);
  chrome.app.window.current().outerBounds.width = this.cornerWidth;
  this.moveCenterTop(this.cornerWidth, this.cornerHeight);

  this.showStep();

  this.$content.hide();

  this.$divStepOfText.html('Step ' + this.model.getCurrentStepDisplay() + ' of ' + this.model.getTotalStepDisplay() + ':');
  this.$divDescription.text(this.model.getCurrentDescription());
  this.populateUrl(this.model.getCurrentUrl());

  if (this.model.isLastStep()) {
    this.$btnNext.html("<span class='expanded-text'>Finish the study!</span><span class='collapsed-text'>Finish</span>");
  }

  this.$content.fadeIn('slow');
  this.resizeStepDescription();
};

PopupView.prototype.next = function() {
  if (this.model.isLastStep()) {
    this.eventBus.trigger('finish', {
      'scenarioResultHashId': this.model.getScenarioResultHashId()
    });

    this.showFinish();
  } else {
    this.model.nextStep();

    this.showMore();

    this.eventBus.trigger('next', {
      'scenarioResultHashId': this.model.getScenarioResultHashId(),
      'scenarioStepHashId': this.model.getScenarioStepHashId()
    });

    this.$content.hide();

    this.$divStepOfText.html('Step ' + this.model.getCurrentStepDisplay() + ' of ' + this.model.getTotalStepDisplay() + ':');
    this.$divDescription.text(this.model.getCurrentDescription());
    this.populateUrl(this.model.getCurrentUrl());

    if (this.model.isLastStep()) {
      this.$btnNext.html("<span class='expanded-text'>Finish the study!</span><span class='collapsed-text'>Finish</span>");
    }

    this.$content.fadeIn('slow');
    this.resizeStepDescription();
  }

}

PopupView.prototype.resizeStepDescription = function() {
  var sectionPadding = this.$divStep.outerHeight() - this.$divStep.height(); /* calculate padding */
  var totalHeight = sectionPadding +
    this.$divCtnDescription.outerHeight(true) +
    this.$titleBar.height();

  chrome.app.window.current().outerBounds.height = Math.max(totalHeight, 86);
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

  this.$ahrefUrl.attr('href', targetUrl);
  this.$ahrefUrl.html(displayUrl);
  window.setTimeout(function() {
    window.open(targetUrl);
  }, 0);
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

PopupView.prototype.pauseUpload = function() {
  this.$btnProgressPause.hide();
  this.$btnProgressPlay.show();
  this.eventBus.trigger('pauseUpload');
}

PopupView.prototype.resumeUpload = function() {
  this.$btnProgressPlay.hide();
  this.$btnProgressPause.show();
  this.eventBus.trigger('resumeUpload');
}
