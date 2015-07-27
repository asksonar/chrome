function Ajaxer(eventBus, config) {
  this.eventBus = eventBus;
  this.url = config.url
  this.accessKeyId = config.accessKeyId;
  this.secretAccessKey = config.secretAccessKey;
  this.endpoint = config.endpoint;
  this.bucket = config.bucket;

  this.init();
}

Ajaxer.prototype.init = function() {
}

Ajaxer.prototype.send = function(command, params, blob, callback) {
  var formData = new FormData();
  if (params) {
    $.each(params, function(key, value){
      formData.append(key, value);
    });
  }
  if (blob) {
    formData.append('dataBinary', blob);
    formData.append('dataMimeType', blob.type);
  }

  $.ajax({
    url: this.url + command,
    data: formData,
    cache: false,
    contentType: false,
    processData: false,
    type: 'POST'
  }).done(function(response){
    console.log('Delivered message: ' + command);
    console.log(params);
    if (callback) {
      callback(response);
    }
  }).fail(function(){
    console.log('Failed message: ' + command);
    console.log(params);
  });
}

Ajaxer.prototype.notifyStart = function(scenarioResultHashId) {
  this.send('/studies/' + scenarioResultHashId, {
    '_method': 'PATCH',
    'status': 'inprogress'
  });
}

Ajaxer.prototype.notifyFinish = function(scenarioResultHashId) {
  this.send('/studies/' + scenarioResultHashId, {
    '_method': 'PATCH',
    'status': 'completed'
  });
}

Ajaxer.prototype.notifyAbort = function(scenarioResultHashId) {
  this.send('/studies/' + scenarioResultHashId, {
    '_method': 'PATCH',
    'status': 'aborted'
  });
}

Ajaxer.prototype.notifyStep = function(resultStep) {
  this.send('/studies/' + resultStep.scenarioResultHashId + '/step', {
    '_method': 'POST',
    'step_json': JSON.stringify(resultStep)
  });
}

Ajaxer.prototype.finishVideo = function(scenarioResultHashId, steps, callback) {
  this.send('/studies/' + scenarioResultHashId + '/video', {
    '_method': 'POST',
    'steps_json': JSON.stringify(steps)
  }, null, callback);
}

Ajaxer.prototype.uploadVideo = function(scenarioResultHashId, uuid, file) {
  var s3 = new AWS.S3({
    'accessKeyId': this.accessKeyId,
    'secretAccessKey': this.secretAccessKey,
    'endpoint': this.endpoint
  });

  var params = {Bucket: this.bucket, Key: uuid, Body: file};
  var managedUpload = s3.upload(params, $.proxy(this.uploadFinish, this, scenarioResultHashId, uuid));

  managedUpload.on('httpUploadProgress', $.proxy(this.uploadProgress, this));
}

Ajaxer.prototype.uploadProgress = function (event) {
  if (event.lengthComputable) {
    this.eventBus.trigger('uploadProgress',
      {percentage: event.loaded / event.total * 100}
    );
  }
}

Ajaxer.prototype.uploadFinish = function(scenarioResultHashId, uuid, err, data) {
  if (err) {
    console.log(err);
  } else {
    //debugger;
    //var uuid = data.Location.split('/').pop();
    this.send('/studies/' + scenarioResultHashId + '/video/' + uuid, {
      '_method': 'PATCH'
    });
    this.eventBus.trigger('uploadFinish');
  }
}
