'use strict';

var basePath;
var fs = require('fs');
var path = require('path');
var Q = require('q');
var marked = require('marked');
var highlight = require('highlight.js');
var constants = require('./constants');
var isCacheEnabled = require('./is-cache-enabled');
var CacheModel = require('./cache-model');

var layoutCache = new CacheModel();
var templateCache = new CacheModel();

marked.setOptions({
  renderer: new marked.Renderer(),
  gfm: true,
  highlight: function (code) {
    return highlight.highlightAuto(code).value;
  }
});

function getLayoutPath() {
  return path.resolve(basePath ? basePath + constants.DEFAULT_LAYOUT_PATH : constants.DEFAULT_LAYOUT_PATH);
}

function getPartialPath(pathname) {
  var partialDir = basePath ? basePath + constants.DEFAULT_PARTIAL_DIR : constants.DEFAULT_PARTIAL_DIR;

  return path.resolve(partialDir + '/' + pathname + '.md');
}

function getPartial(pathname) {
  return Q.Promise(function (resolve, reject) {
    var file = getPartialPath(pathname);

    fs.readFile(file, 'utf8', function (err, string) {
      var result = {};

      if (err) {
        reject(err);
        return;
      }

      result['___' + pathname] = marked(string.trim());
      resolve(result);
    });
  });
}

function extractPartials(src) {
  var partials = src.match(/\{{(\&gt\;|>)([^}]+)\}}/g);

  if (partials) {
    partials = partials.map(function (partial) {
      var pathname = partial.replace(/{|}|&gt;|\s|\'|\"/g, '');
      return getPartial(pathname);
    });

    return Q.all(partials);
  } else {
    return Q.resolve();
  }
}

function hydrate(html, data) {
  return Q.Promise(function (resolve, reject) {
    function _hydrate(str) {
      str = str || html;

      return str.replace(/\{{([^}]+)\}}/g, function (_, name) {
        name = name.replace(/(\&gt\;|>)\s/, '___');

        return data[name] || '';
      });
    }

    extractPartials(html).then(function (partials) {
      if (partials) {
        partials.forEach(function (partial) {
          for (var key in partial) {
            if (partial.hasOwnProperty(key)) {
              var partialTemplate = partial[key];

              data[key] = _hydrate(partialTemplate);
            }
          }
        });

        resolve(_hydrate());
      } else {
        resolve(_hydrate());
      }
    }, function (err) {
      reject(err);
    });
  });
}

function renderMarkdownTemplate(filePath, options, callback) {
  var templateHtml;

  if (templateCache.get(filePath) && isCacheEnabled()) {
    hydrate(templateCache.get(filePath), options).then(function (html) {
      callback(null, html);
    }, function (err) {
      callback(err);
    });
  } else {
    fs.readFile(filePath, 'utf8', function (err, str) {
      if (err) return callback(err);

      try {
        templateHtml = marked(str.trim());

        templateCache.set(filePath, templateHtml);

        hydrate(templateHtml, options).then(function (html) {
          callback(null, html);
        }, function (err) {
          callback(err);
        });
      } catch(err) {
        callback(err);
      }
    });
  }
}

function renderLayoutWithTemplate(templateHtml, layoutHtml, options, fn) {
  options.body = templateHtml;

  hydrate(layoutHtml, options).then(function (html) {
    fn(null, html);
  }, function (err) {
    fn(err);
  });
}

function continueConfiguration(filePath, options, fn) {
  var layoutHtml;
  var layoutTemplatePath = getLayoutPath();

  renderMarkdownTemplate(filePath, options, function (err, templateHtml) {
    if (err) {
      return fn(err);
    } else {
      if (layoutCache.get(layoutTemplatePath) && isCacheEnabled()) {
        layoutHtml = layoutCache.get(layoutTemplatePath);
        renderLayoutWithTemplate(templateHtml, layoutHtml, options, fn);
      } else {
        fs.readFile(layoutTemplatePath, 'utf8', function (err, html) {
          if (err) {
            return fn(err);
          }

          html = html.trim();

          layoutCache.set(layoutTemplatePath, html);

          renderLayoutWithTemplate(templateHtml, html, options, fn);
        });
      }
    }
  });
}

module.exports = {
  configure: function (options) {
    basePath = options.basePath + '/' || '';

    return continueConfiguration;
  }
};
