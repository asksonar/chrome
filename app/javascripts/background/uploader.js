function Uploader(config) {
  this.s3 = config.s3;
  this.bucket = config.bucket;
  this.key = config.key;
  this.file = config.file;
  this.onProgress = config.onProgress;
  this.onFinish = config.onFinish;
  this.onError = config.onError;

  this.init();
}

Uploader.prototype.init = function() {
  this.queue = $({});
  this.etags = [];

  this.chunkSize = 5 * 1024 * 1024;

  this.lastPaused = Date.now();
}

Uploader.prototype.pause = function() {
  this.paused = true;
  this.lastPaused = Date.now();
}

Uploader.prototype.resume = function() {
  this.paused = false;
  if (this.pausedFunction) {
    this.pausedFunction.resolve();
  }
}

Uploader.prototype.betweenPart = function(next) {
  /*
  // pause the upload for a second if it's been running continuously for 10 seconds
  if (Date.now() - this.lastPaused > 10 * 1000) {
    this.lastPaused = Date.now();
    window.setTimeout($.proxy(this.betweenPart, this, next), 1000);
    return;
  }
  */

  if (this.paused) {
    this.pausedFunction = $.Deferred();
    this.pausedFunction.done($.proxy(next, this));
  } else {
    next();
  }
}

Uploader.prototype.createMultipartUpload = function(next) {
  this.s3.createMultipartUpload({
    Bucket: this.bucket,
    Key: this.key
  }, $.proxy(function(err, data) {
    if (err) {
      this.onError(err);
    } else {
      this.uploadId = data.UploadId;
      next();
    }
  }, this));
}

Uploader.prototype.uploadPart = function(index, next) {
  var startSlice = index * this.chunkSize;
  var endSlice = Math.min((index + 1) * this.chunkSize, this.file.size);
  var body = this.file.slice(startSlice, endSlice);
  this.s3.uploadPart({
    Bucket: this.bucket,
    Key: this.key,
    PartNumber: index + 1, // partNumber starts counting from 1 and up
    UploadId: this.uploadId,
    Body: body
  }, $.proxy(function(err, data) {
    if (err) {
      this.onError(err);
    } else {
      this.etags[index] = data.ETag;
      this.onProgress({
        lengthComputable: true,
        loaded: endSlice,
        total: this.file.size
      });
      next();
    }
  }, this));
}

Uploader.prototype.completeMultipartUpload = function(next) {
  var parts = [];
  for (var i = 0; i < this.etags.length; i++) {
    parts.push({
      ETag: this.etags[i],
      PartNumber: i + 1 // partNumber starts counting from 1 and up
    });
  }

  this.s3.completeMultipartUpload({
    Bucket: this.bucket,
    Key: this.key,
    UploadId: this.uploadId,
    MultipartUpload: {
      Parts: parts
    }
  }, $.proxy(function(err, data) {
    if (err) {
      this.onError(err);
    } else {
      this.onFinish();
      next();
    }
  }, this));
}

Uploader.prototype.start = function() {
  this.queue.queue($.proxy(this.createMultipartUpload, this));
  for(var i = 0; i < this.file.size / this.chunkSize; i++) {
    this.queue.queue($.proxy(this.betweenPart, this));
    this.queue.queue($.proxy(this.uploadPart, this, i));
  }
  this.queue.queue($.proxy(this.completeMultipartUpload, this));
}
