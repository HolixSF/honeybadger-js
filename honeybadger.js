/*
  honeybadger-js
  A JavaScript Notifier for Honeybadger
  https://github.com/honeybadger-io/honeybadger-js
  https://www.honeybadger.io/
  MIT license
*/
(function(window) {
// Generated by CoffeeScript 1.7.1
var Configuration;

Configuration = (function() {
  Configuration.defaults = {
    api_key: null,
    host: 'api.honeybadger.io',
    ssl: true,
    project_root: window.location.protocol + '//' + window.location.host,
    environment: 'production',
    component: null,
    action: null,
    disabled: true,
    onerror: false
  };

  function Configuration(options) {
    var k, v, _ref;
    if (options == null) {
      options = {};
    }
    _ref = this.constructor.defaults;
    for (k in _ref) {
      v = _ref[k];
      this[k] = v;
    }
    for (k in options) {
      v = options[k];
      this[k] = v;
    }
  }

  Configuration.prototype.reset = function() {
    var k, v, _ref;
    _ref = this.constructor.defaults;
    for (k in _ref) {
      v = _ref[k];
      this[k] = v;
    }
    return this;
  };

  return Configuration;

})();
// Generated by CoffeeScript 1.7.1
var Notice;

Notice = (function() {
  function Notice(options) {
    var k, v, _ref, _ref1, _ref2, _ref3, _ref4;
    this.options = options != null ? options : {};
    this.error = this.options.error;
    this.stack = (_ref = this.error) != null ? _ref.stack : void 0;
    this["class"] = (_ref1 = this.error) != null ? _ref1.name : void 0;
    this.message = (_ref2 = this.error) != null ? _ref2.message : void 0;
    this.source = null;
    this.url = document.URL;
    this.project_root = Honeybadger.configuration.project_root;
    this.environment = Honeybadger.configuration.environment;
    this.component = Honeybadger.configuration.component;
    this.action = Honeybadger.configuration.action;
    this.context = {};
    _ref3 = Honeybadger.context;
    for (k in _ref3) {
      v = _ref3[k];
      this.context[k] = v;
    }
    if (this.options.context && typeof this.options.context === 'object') {
      _ref4 = this.options.context;
      for (k in _ref4) {
        v = _ref4[k];
        this.context[k] = v;
      }
    }
  }

  Notice.prototype.toJSON = function() {
    return JSON.stringify({
      notifier: {
        name: 'honeybadger.js',
        url: 'https://github.com/honeybadger-io/honeybadger-js',
        version: Honeybadger.version,
        language: 'javascript'
      },
      error: {
        "class": this["class"],
        message: this.message,
        backtrace: this.stack,
        source: this.source
      },
      request: {
        url: this.url,
        component: this.component,
        action: this.action,
        context: this.context,
        cgi_data: this._cgiData()
      },
      server: {
        project_root: this.project_root,
        environment_name: this.environment
      }
    });
  };

  Notice.prototype._parseBacktrace = function(stack) {
    var backtrace, trace, _i, _len, _ref, _ref1;
    if (stack == null) {
      stack = [];
    }
    backtrace = [];
    for (_i = 0, _len = stack.length; _i < _len; _i++) {
      trace = stack[_i];
      if ((_ref = trace.url) != null ? _ref.match(/honeybadger(?:\.min)?\.js/) : void 0) {
        continue;
      }
      backtrace.push({
        file: ((_ref1 = trace.url) != null ? _ref1.replace(Honeybadger.configuration.project_root, '[PROJECT_ROOT]') : void 0) || 'unknown',
        number: trace.line,
        method: trace.func
      });
    }
    return backtrace;
  };

  Notice.prototype._extractSource = function(stack) {
    var i, line, source, _i, _len, _ref, _ref1, _ref2;
    if (stack == null) {
      stack = [];
    }
    source = {};
    _ref2 = (_ref = (_ref1 = stack[0]) != null ? _ref1.context : void 0) != null ? _ref : [];
    for (i = _i = 0, _len = _ref2.length; _i < _len; i = ++_i) {
      line = _ref2[i];
      source[i] = line;
    }
    return source;
  };

  Notice.prototype._cgiData = function() {
    var data, k, v;
    data = {};
    for (k in navigator) {
      v = navigator[k];
      if (!(v instanceof Object)) {
        data[k.split(/(?=[A-Z][a-z]*)/).join('_').toUpperCase()] = v;
      }
    }
    data['HTTP_USER_AGENT'] = data['USER_AGENT'];
    delete data['USER_AGENT'];
    if (document.referrer.match(/\S/)) {
      data['HTTP_REFERER'] = document.referrer;
    }
    return data;
  };

  return Notice;

})();
// Generated by CoffeeScript 1.7.1
var Honeybadger, UncaughtError,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Honeybadger = {
  version: '0.1.0',
  configured: false,
  configure: function(options) {
    var k, v;
    if (options == null) {
      options = {};
    }
    if (this.configured === false) {
      if (typeof options.disabled === 'undefined') {
        options['disabled'] = false;
      }
      this.configured = true;
    }
    for (k in options) {
      v = options[k];
      this.configuration[k] = v;
    }
    return this;
  },
  configuration: new Configuration(),
  context: {},
  resetContext: function(options) {
    if (options == null) {
      options = {};
    }
    this.context = options instanceof Object ? options : {};
    return this;
  },
  setContext: function(options) {
    var k, v;
    if (options == null) {
      options = {};
    }
    if (options instanceof Object) {
      for (k in options) {
        v = options[k];
        this.context[k] = v;
      }
    }
    return this;
  },
  beforeNotifyHandlers: [],
  beforeNotify: function(handler) {
    return this.beforeNotifyHandlers.push(handler);
  },
  notify: function(error, options) {
    var handler, k, notice, v, _i, _len, _ref;
    if (options == null) {
      options = {};
    }
    if (!this.configured || this.configuration.disabled === true) {
      return false;
    }
    if (error instanceof Error) {
      options['error'] = error;
    } else if (typeof error === 'string') {
      options['error'] = new Error(error);
    } else if (error instanceof Object) {
      for (k in error) {
        v = error[k];
        options[k] = v;
      }
    }
    if (((function() {
      var _results;
      _results = [];
      for (k in options) {
        if (!__hasProp.call(options, k)) continue;
        _results.push(k);
      }
      return _results;
    })()).length === 0) {
      return false;
    }
    notice = new Notice(options);
    _ref = this.beforeNotifyHandlers;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      handler = _ref[_i];
      if (handler(notice) === false) {
        return false;
      }
    }
    return this._sendRequest(notice.toJSON());
  },
  wrap: function(func) {
    return function() {
      var e;
      try {
        return func.apply(this, arguments);
      } catch (_error) {
        e = _error;
        Honeybadger.notify(e);
        throw e;
      }
    };
  },
  reset: function() {
    this.resetContext();
    this.configuration.reset();
    this.configured = false;
    return this;
  },
  install: function() {
    if (this.installed === true) {
      return;
    }
    this._oldOnErrorHandler = window.onerror;
    window.onerror = this._windowOnErrorHandler;
    this._installed = true;
    return this;
  },
  _sendRequest: function(data) {
    var url;
    url = 'http' + ((this.configuration.ssl && 's') || '') + '://' + this.configuration.host + '/v1/notices.html';
    return this._crossDomainPost(url, data);
  },
  _crossDomainPost: function(url, payload) {
    var form, iframe, input, uniqueNameOfFrame;
    iframe = document.createElement('iframe');
    uniqueNameOfFrame = '_hb_' + (new Date).getTime();
    document.body.appendChild(iframe);
    iframe.style.display = 'none';
    iframe.contentWindow.name = uniqueNameOfFrame;
    form = document.createElement('form');
    form.target = uniqueNameOfFrame;
    form.action = url;
    form.method = 'POST';
    input = document.createElement('input');
    input.type = 'hidden';
    input.name = "payload";
    input.value = payload;
    form.appendChild(input);
    input = document.createElement('input');
    input.type = 'hidden';
    input.name = "api_key";
    input.value = this.configuration.api_key;
    form.appendChild(input);
    document.body.appendChild(form);
    return form.submit();
  },
  _windowOnErrorHandler: function(msg, url, line, col, error) {
    if (Honeybadger.configuration.onerror) {
      if (!error) {
        error = new UncaughtError(msg, url, line, col);
      }
      Honeybadger.notify(error);
    }
    if (this._oldOnErrorHandler) {
      return this._oldOnErrorHandler.apply(this, arguments);
    }
    return false;
  }
};

UncaughtError = (function(_super) {
  __extends(UncaughtError, _super);

  function UncaughtError(message, url, line, column) {
    this.name = 'UncaughtError';
    this.message = message || 'An unknown error was caught by window.onerror.';
    this.stack = [this.message, '\n    at ? (', url || 'unknown', ':', line || 0, ':', column || 0, ')'].join('');
  }

  return UncaughtError;

})(Error);
  window.Honeybadger = Honeybadger;
  Honeybadger.install();
})(window);
