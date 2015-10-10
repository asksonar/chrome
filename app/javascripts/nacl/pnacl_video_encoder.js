'use strict';
// Copyright 2013 Manuel Braun (mb@w69b.com). All Rights Reserved.
/**
 * API of the pnacl video encoder module.
 */
function PnaclVideoEncoder(url, isPortable) {
  var pnacl = PnaclModule(url, isPortable);

  var pendingOperationDeferred = null;
  var START_TIMEOUT = 8000;
  var DEFERRED_OPERATIONS = ['start', 'stop', 'pause', 'resume', 'replaceTracks'];
  var lastStateObj;
  var startTimeoutTimer;
  var api = {};

  function resetState() {
    lastStateObj = {state: 'inactive', time: 0};
  }

  function unload() {
    pnacl.unload();
    resetState();
  }

  function setStateObj(obj) {
    lastStateObj = obj;
  }

  function unloadAndCancelPending(err) {
    unload();
    if (pendingOperationDeferred)
      pendingOperationDeferred.reject(err);
    pendingOperationDeferred = null;
  }

  function onError(err) {
    console.error('pnaclVideoEncoderError', err);
    unloadAndCancelPending(err);
    if (api.onError)
      api.onError(err);
  }

  function onCrash(coreDump) {
    unloadAndCancelPending();
    if (api.onCrash) api.onCrash(coreDump);
  }

  /**
   * Extract major chrome version from user agent string.
   * @return {number} major chrome Version or 0 if it cannot be determined.
   */
  function getChromeVersion() {
    return Number((/Chrome\/(\d+)/.exec(window.navigator.userAgent) || [, 0])[1]);
  }

  pnacl.onMessage = function onMessage(msg) {
    msg = msg.data;
    if (DEFERRED_OPERATIONS.indexOf(msg.type) >= 0) {
      if (!pendingOperationDeferred) return;
      if (msg.data)
        pendingOperationDeferred.reject(msg.data);
      else
        pendingOperationDeferred.resolve();
      pendingOperationDeferred = null;
    } else if (msg.type == 'error') {
      onError(msg.data);
    } else if (msg.type == 'state') {
      setStateObj(msg.data);
    } else if (msg.type == 'stack_trace') {
      onCrash(msg.data);
    } else {
      var data;
      if (msg.data) {
        data = msg.data;
        if (data.trim)
          data = data.trim();
      }
      console.debug(msg.type, data);
    }
  };

  function postMessage(type, msg) {
    pnacl.postMessage({
      type: type,
      data: msg || {}
    });
  }

  function startDeferredOperation(type, msg) {
    if (pendingOperationDeferred)
      throw new Error('there is still a pending operation');
    pendingOperationDeferred = {};
    pendingOperationDeferred.promise = new Promise(function(resolve, reject) {
      pendingOperationDeferred.resolve = resolve;
      pendingOperationDeferred.reject = reject;
    });
    if (type)
      postMessage(type, msg);
    return pendingOperationDeferred.promise;
  }

  /**
   * Function that is called when the encoder module crashes.
   */
  api.onCrash = undefined;

  pnacl.onCrash = onCrash;

  // Public api

  /**
   * @return {Promise} that resolves when closed.
   */
  api.stop = function() {
    return startDeferredOperation('stop').then(function() {
      unload();
    });
  };

  /**
   * @return {promise} that resolves when pnacl module is loaded.
   */
  api.load = function() {
    return pnacl.load();
  };

  /**
   * @return {string} one of paused, recording, inactive.
   */
  api.getState = function() {
    return lastStateObj.state;
  };

  /**
   * @return {Object} object with state, fps, time properties
   */
  api.getStateObj = function() {
    return lastStateObj;
  };

  api.getFPS = function() {
    return lastStateObj.fps;
  };

  api.getCurrentTime = function() {
    return lastStateObj.time;
  };

  api.replaceTracks = function(tracks) {
    return startDeferredOperation('replaceTracks', tracks);
  };

  api.pause = function() {
    return startDeferredOperation('pause');
  };

  api.resume = function() {
    return startDeferredOperation('resume');
  };

  api.hasPendingOperation = function() {
    return !!pendingOperationDeferred;
  };

  /**
   * Send open message to pnacl encoder.
   * @param {Object} config object with properties:
   * - filename: destination filename in html5 filesystem. Prefix with
   *   /html5_persistent/ to use the persistent html5 filesystem or with
   *   /html5_temporary/ to use the temporary html5 filesystem.
   * - videoTrack: MediaStreamTrack main video track
   * - audioTrack: MediaStreamTrack optional audio track
   * - camTrack: MediaStreamTrack optional camera track
   */
  api.start = function(config) {
    if (!/^\/html5_(temporary|persistent)\//.test(config.filename))
      throw new Error('invalid filename');
    config.chromeVersion = getChromeVersion();
    var operationPromise = startDeferredOperation();
    startTimeoutTimer = window.setTimeout(function startTimedOut() {
      // rejects the operationPromise and unloads module.
      onError('start_timeout');
    }, START_TIMEOUT);
    function cancelTimer() {
      window.clearTimeout(startTimeoutTimer);
      startTimeoutTimer = null;
    }
    var promise =  pnacl.load()
      .then(function() {
        postMessage('start', config);
        return operationPromise;
      })
    promise.then(cancelTimer, cancelTimer);
    return promise;
  };

  resetState();

  return api;
}

