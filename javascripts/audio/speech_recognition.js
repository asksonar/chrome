function SpeechRecognition(startTime) {
  this.startTime = startTime;
  this.init();
}

SpeechRecognition.prototype.init = function() {
  this.results = [];
}

SpeechRecognition.prototype.start = function() {
  //console.log(Date.now() + ": Starting new speech" );
  this.recognition = new webkitSpeechRecognition();
  this.recognition.continuous = false;
  this.recognition.interimResults = false;
  this.recognition.onspeechstart = $.proxy(this.onspeechstart, this);
  this.recognition.onresult = $.proxy(this.onresult, this);
  this.recognition.onend = $.proxy(this.onend, this);
  this.recognition.start();
}

SpeechRecognition.prototype.debug = function() {
  var speech = new webkitSpeechRecognition();
  speech.onaudioend = function(){console.log(Date.now() + ': onaudioend')};
  speech.onaudiostart = function(){console.log(Date.now() + ': onaudiostart')};
  speech.onend = function(){console.log(Date.now() + ': onend')};
  speech.onerror = function(){console.log(Date.now() + ': onerror')};
  speech.onnomatch = function(){console.log(Date.now() + ': onnomatch')};
  speech.onresult = function(){console.log(Date.now() + ': onresult')};
  speech.onsoundend = function(){console.log(Date.now() + ': onsoundend')};
  speech.onsoundstart = function(){console.log(Date.now() + ': onsoundstart')};
  speech.onspeechend = function(){console.log(Date.now() + ': onspeechend')};
  speech.onspeechstart = function(){console.log(Date.now() + ': onspeechstart')};
  speech.onstart = function(){console.log(Date.now() + ': onstart')};
  return speech;
}

SpeechRecognition.prototype.onspeechstart = function() {
  this.offset = Date.now() - this.startTime;
}

SpeechRecognition.prototype.onresult = function() {
  var results = [];
  var result;
  for (var i = event.resultIndex; i < event.results.length; ++i) {
    result = event.results[i][0].transcript;
    results.push(result);
    console.log(Date.now() + ': ' + event.results[i][0].transcript + ' (' + event.results[i][0].confidence + ')');
  }

  //console.log(Date.now() + ': ' + results);
  this.results.push({
    'offset': this.offset,
    'text': results.join(', ')
  });
}

SpeechRecognition.prototype.onend = function() {
  this.start();
}

SpeechRecognition.prototype.stop = function(onend) {
  if (this.recognition) {
    console.log(Date.now() + ": Stopping old speech" );
    this.recognition.onend = onend;
    this.recognition.stop();
  }
}

SpeechRecognition.prototype.getResults = function() {
  return this.results;
}
