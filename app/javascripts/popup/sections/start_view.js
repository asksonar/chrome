function StartView(config, model) {
  this.$section = config.section;
  this.$btnFirstStep = config.btnFirstStep;

  this.width = config.width;
  this.height = config.height;

  this.model = model;

  this.initHandlers();
}

StartView.prototype = Object.create(SectionView.prototype);
StartView.prototype.constructor = StartView;

StartView.prototype.initHandlers = function() {
  this.$btnFirstStep.on('click', $.proxy(this.onFirstStep, this));
};

StartView.prototype.onFirstStep = function(event, eventData) {
  this.next();
};

StartView.prototype.show = function() {
  this.resize(this.width, this.height);
  this.moveCenter(this.width, this.height, 0);
  this.$section.show();

  // we start recording and act as if the first step has already started
  // even though the first step is not yet visualy on the screen
  // until they click this.$btnFirstStep
  this.model.startStep();
};
