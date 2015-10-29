function StepView(config) {
  this.$section = config.section;
  this.width = config.width;
  this.minHeight = config.minHeight;

  this.$btnNext = config.btnNext;
  this.$btnDelighted = config.btnDelighted;
  this.$btnConfused = config.btnConfused;

  this.$btnShowLess = config.btnShowLess;
  this.$btnShowMore = config.btnShowMore;

  this.$divDescription = config.divDescription;
  this.$divStepOfText = config.divStepOfText;
  this.$divCtnDescription = config.divCtnDescription;
  this.$ahrefUrl = config.ahrefUrl;
  this.$titleBar = config.titleBar;

  this.$speechReminder = config.speechReminder;
}

StepView.prototype.initHandlers = function() {
  this.on('click', this.$btnNext, this.onNextStep);
  this.on('click', this.$btnDelighted, this.delighted);
  this.on('click', this.$btnConfused, this.confused);

  this.on('click', this.$btnShowLess, this.showLess);
  this.on('click', this.$btnShowMore, this.showMore);
};

StepView.prototype.show = function() {
  this.resize(this.width);
  this.moveCenterTop(this.width);

  this.startSpeechReminder();

  // section is shown by updateFields
  this.updateFields();
  this.$section.show();
  this.showMore();
};

StepView.prototype.hide = function() {
  this.stopSpeechReminder();
  this.$section.hide();
};

StepView.prototype.onNextStep = function() {
  var hasNextStep = this.model.nextStep();
  if (hasNextStep) {
    this.updateFields();
    this.showMore();
    this.$section.fadeIn('slow');
  } else {
    this.next();
  }
};

StepView.prototype.updateFields = function() {
  this.$divStepOfText.html('Step ' + this.model.getCurrentStepDisplay() + ' of ' + this.model.getTotalStepDisplay() + ':');
  this.$divDescription.text(this.model.getCurrentDescription());
  this.populateUrl(this.model.getCurrentUrl());

  if (this.model.isLastStep()) {
    this.$btnNext.html("<span class='expanded-text'>Finish the study!</span><span class='collapsed-text'>Finish</span>");
  }
};

StepView.prototype.resizeStepDescription = function() {
  var sectionPadding = this.$divStep.outerHeight() - this.$divStep.height(); /* calculate padding */
  var totalHeight = sectionPadding +
    this.$divCtnDescription.outerHeight(true) +
    this.$titleBar.height();

  this.resize(null, Math.max(totalHeight, this.minHeight));
};

StepView.prototype.showLess = function() {
  this.$divStep.removeClass('expanded').addClass('collapsed');
  this.resizeStepDescription();
};

StepView.prototype.showMore = function() {
  this.$divStep.removeClass('collapsed').addClass('expanded');
  this.resizeStepDescription();
};

StepView.prototype.delighted = function() {
  this.model.delighted();
};

StepView.prototype.confused = function() {
  this.model.confused();
};

StepView.prototype.populateUrl = function(url) {
  if (!url) {
    this.$ahrefUrl.html('');
    return;
  }

  var targetUrl = url.indexOf('http') === 0 ? url : 'http://' + url;
  var displayUrl =
    ( url.indexOf('https://') === 0 ? url.substring('https://'.length)
    : url.indexOf('http://') === 0 ? url.substring('http://'.length)
    : url );

  this.$ahrefUrl.attr('href', targetUrl);
  this.$ahrefUrl.html(displayUrl);
  window.setTimeout(function() {
    window.open(targetUrl);
  }, 0);
};

StepView.prototype.startSpeechReminder = function() {
  // just to reset the starting timer
  this.mostRecentLoudNoise = Date.now();

  this.speechReminderLoop = setInterval($.proxy(function() {
    if (this.$speechReminder.queue().length) {
      return;
    }

    if ((Date.now() - this.mostRecentLoudNoise) > 15000) {
      this.$speechReminder.css({display:'flex'});
    } else {
      this.$speechReminder.css({display:'none'});
    }

  }, this), 250);
};


StepView.prototype.stopSpeechReminder = function() {
  clearInterval(this.speechReminderLoop);
};
