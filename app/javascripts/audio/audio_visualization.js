function AudioVisualization(minDecibels, maxDecibels) {
  this.minDecibels = minDecibels;
  this.maxDecibels = maxDecibels;
}

AudioVisualization.prototype.start = function() {
  this.context = new AudioContext();
  this.analyser = this.context.createAnalyser();
  this.analyser.fftSize = 32;
  this.analyser.minDecibels = this.minDecibels
  this.analyser.maxDecibels = this.maxDecibels; // raise from default of -90
  this.analyser.smoothingTimeConstant = .9;
  navigator.webkitGetUserMedia({audio: true}, $.proxy(this.gotStream, this), $.proxy(this.gotStreamError, this));
};

AudioVisualization.prototype.stop = function() {
  this.stream.getTracks().forEach(function(track) {
    track.stop();
  });

  if (this.context && this.context.state !== 'closed') {
    this.context.close();
    this.context = null;
    this.analyser = null;
  }
};

AudioVisualization.prototype.gotStream = function(stream) {
  this.stream = stream;
  this.stream.onended = $.proxy(this.onStreamEnded, this);

  var source = this.context.createMediaStreamSource(stream);
  source.connect(this.analyser);
};

AudioVisualization.prototype.gotStreamError = function(error) {
  console.log("Error getting audio stream for visualization: " + error);
};

AudioVisualization.prototype.onStreamEnded = function() {
  console.log("Terminated audio stream for visualization.");
};

AudioVisualization.prototype.getAmplitude = function() {
  var bufferLength = this.analyser.frequencyBinCount;
  var dataArray = new Uint8Array(bufferLength);
  this.analyser.getByteFrequencyData(dataArray);

  var maxHeight = 0;
  for(var i = 0; i < bufferLength; i++) {
    if (dataArray[i] > maxHeight) {
      maxHeight = dataArray[i];
    }
  }

  return maxHeight;
};
