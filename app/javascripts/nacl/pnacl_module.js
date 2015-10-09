'use strict';

/**
 * Helper to embed a hidden pnacl module in the document and communicate
 * with it.
 * @param {string} manifestPath path to manifest file.
 * @param {boolean} isPortable set this to true if manifest points to a pnacl module.
 * @param {Element=} parentEl parent element, defaults to body.
 * @return {Object} pnacl module api.
 */
function PnaclModule(manifestPath, isPortable, parentEl) {
  var LOAD_TIMEOUT = 15000;
  var type = isPortable ? 'pnacl' : 'nacl';
  var PNACL_HTML = ['<embed ',
    'width=0 height=0 ',
    'src="' + manifestPath + '" ',
    'ps_tty_prefix="ps:" ps_stdout="/dev/tty" ps_stderr="/dev/tty" ' +
    'type="application/x-' + type + '" />'].join('');
  // use x-pnacl for pnacl (and modify manifest)

  if (!parentEl)
    parentEl = document.body;

  var containerEl = document.createElement('div');
  var loadingPromise;

  var api = {isLoaded: false};
  api.onMessage = undefined;
  api.onCrash = undefined;

  var domModule;

  function addListeners() {
    containerEl.addEventListener('crash', onCrash, true);
    containerEl.addEventListener('message', onMessage, true);
  }

  function removeListeners() {
    containerEl.removeEventListener('message', onMessage, true);
    containerEl.removeEventListener('crash', onCrash, true);
  }


  /**
   * Native module loaded
   */
  function onCrash() {
    console.error('pnacl module crashed', domModule.lastError);
    if (api.onCrash) api.onCrash(domModule.lastError);
  }

  /**
   * Message received from native module
   */
  function onMessage(msg) {
    if (api.onMessage) api.onMessage(msg);
  }


  /**
   * @return {Promise} that resolvs when loaded or rejects when
   * loading fails.
   */
  api.load = function() {
    if (loadingPromise) return loadingPromise;

    var loadTimeoutTimer;
    loadingPromise = new Promise(function(resolve, reject) {
      function unlisten() {
        containerEl.removeEventListener('load', onLoad, true);
        containerEl.removeEventListener('error', onError, true);
      }

      function onLoad() {
        unlisten();
        resolve();
      }

      function onError() {
        unlisten();
        reject(domModule.lastError);
      }

      containerEl.addEventListener('load', onLoad, true);
      containerEl.addEventListener('error', onError, true);
      addListeners();
      loadTimeoutTimer = window.setTimeout(function loadTimedout() {
        reject('load_timeout');
      }, LOAD_TIMEOUT);
      containerEl.innerHTML = PNACL_HTML;
      domModule = containerEl.children[0];
      parentEl.appendChild(containerEl);
      // HACK: pnacl module is not loaded on background page without focus().
      containerEl.focus();
    });
    var promise = loadingPromise;
    function cancelTimer() {
      window.clearTimeout(loadTimeoutTimer);
      loadingPromise = null;
    }
    loadingPromise.then(cancelTimer, cancelTimer);
    loadingPromise.catch(function() {
      api.unload();
    });
    return promise;
  };

  /**
   * NOTE: currently chrome sesems to be unable to load a nacl module once unloaded.
   */
  api.unload = function() {
    api.isLoaded = false;
    removeListeners();
    containerEl.innerHTML = '';
    parentEl.removeChild(containerEl);
    domModule = null;
    loadingPromise = null;
  };

  api.getElement = function() {
    return domModule;
  };

  api.postMessage = function(msg) {
    if (!domModule) throw new Error('not loaded');
    domModule.postMessage(msg);
  };

  return api;
}

