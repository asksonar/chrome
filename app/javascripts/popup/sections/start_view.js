function StartView(section) {
  this.$section = config.section;
  this.width = config.width;
  this.height = config.height;
  this.$btnFirstStep = config.btnFirstStep;
}

StartView.prototype.initHandlers = function() {
  this.on('click', this.$btnFirstStep, this.next);
}

StartView.prototype.show = function() {
  this.resize(this.width, this.height);
  this.moveCenter(this.width, this.height, 0);
  this.$section.show();

  // we start recording and act as if the first step has already started
  // even though the first step is not yet visualy on the screen
  // until they click this.$btnFirstStep
  this.model.startStep();
};
