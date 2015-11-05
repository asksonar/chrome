function StepView(config, speechReminder) {
  this.config = config;
  this.speechReminder = speechReminder;
}

StepView.prototype = Object.create(SectionView.prototype);
StepView.prototype.constructor = StepView;

StepView.prototype.init = function(flow) {
  this.$section = this.config.section;

  this.$btnNext = this.config.btnNext;
  this.$btnDelighted = this.config.btnDelighted;
  this.$btnConfused = this.config.btnConfused;
  this.$btnShowLess = this.config.btnShowLess;
  this.$btnShowMore = this.config.btnShowMore;

  this.$divDescription = this.config.divDescription;
  this.$divStepOfText = this.config.divStepOfText;
  this.$divCtnDescription = this.config.divCtnDescription;
  this.$ahrefUrl = this.config.ahrefUrl;
  this.$titleBar = this.config.titleBar;

  this.width = this.config.width;
  this.minHeight = this.config.minHeight;

  this.model = flow.model;

  this.speechReminder.init();

  this.initHandlers();
};

StepView.prototype.initHandlers = function() {
  this.$btnNext.on('click', $.proxy(this.onNextStep, this));
  this.$btnDelighted.on('click', $.proxy(this.delighted, this));
  this.$btnConfused.on('click', $.proxy(this.confused, this));

  this.$btnShowLess.on('click', $.proxy(this.showLess, this));
  this.$btnShowMore.on('click', $.proxy(this.showMore, this));
};

StepView.prototype.show = function() {
  this.resize(this.width);
  this.moveCenterTop(this.width);

  this.speechReminder.start();

  // section is shown by updateFields
  this.updateFields();
  this.$section.show();
  this.showMore();
};

StepView.prototype.hide = function() {
  this.speechReminder.stop();
  this.$section.hide();
};

StepView.prototype.onNextStep = function() {
  if (this.model.isLastStep()) {
    this.model.finishStep();
    this.next();
  } else {
    this.model.nextStep();
    this.updateFields();
    this.showMore();
    this.$section.fadeIn('slow');
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
  var sectionPadding = this.$section.outerHeight() - this.$section.height(); /* calculate padding */
  var totalHeight = sectionPadding +
    this.$divCtnDescription.outerHeight(true) +
    this.$titleBar.height();

  this.resize(null, Math.max(totalHeight, this.minHeight));
};

StepView.prototype.showLess = function() {
  this.$section.removeClass('expanded').addClass('collapsed');
  this.resizeStepDescription();
};

StepView.prototype.showMore = function() {
  this.$section.removeClass('collapsed').addClass('expanded');
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
