function StartView(config) {
  this.config = config;
}

StartView.prototype = Object.create(SectionView.prototype);
StartView.prototype.constructor = StartView;

StartView.prototype.init = function(flow) {
  this.$section = this.config.section;
  this.$btnFirstStep = this.config.btnFirstStep;

  this.width = this.config.width;
  this.height = this.config.height;

  this.model = flow.model;

  this.initHandlers();
};

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
