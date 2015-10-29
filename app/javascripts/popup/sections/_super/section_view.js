function SectionView(){}

SectionView.prototype.onNext = function(nextElement) {
  this.nextElement = nextElement;
};

SectionView.prototype.onPrev = function(prevElement) {
  this.prevElement = prevElement;
};

SectionView.prototype.next = function() {
  this.hide();
  this.nextElement.show();
};

SectionView.prototype.prev = function() {
  this.hide();
  this.prevElement.show();
};

SectionView.prototype.show = function() {
  this.$section.show();
};

SectionView.prototype.hide = function() {
  this.$section.hide();
};

SectionView.prototype.close = function() {
  return {
    show: function() { window.close(); }
  };
};

SectionView.prototype.resize = function(width, height) {
  if (parseInt(width)) {
    $('.content').width(width); // TODO: abstract this more neatly
    chrome.app.window.current().outerBounds.width = width;
  }
  if (parseInt(height)) {
    chrome.app.window.current().outerBounds.height = height;
  }
};

SectionView.prototype.move = function(targetLeft, targetTop, duration) {
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

SectionView.prototype.moveCenter = function(width, height, duration) {
  this.move(
    window.screen.availLeft + Math.round((window.screen.availWidth - width) / 2),
    window.screen.availTop + Math.round((window.screen.availHeight - height) / 2),
    duration
  );
};

SectionView.prototype.moveCenterTop = function(width, duration) {
  this.move(
    window.screen.availLeft + Math.round((window.screen.availWidth - width) / 2),
    window.screen.availTop + 0,
    duration
  );
};

SectionView.prototype.moveRightTop = function(width, duration) {
  this.move(
    screen.availLeft + screen.availWidth - width,
    screen.availTop + 0,
    duration
  );
}
