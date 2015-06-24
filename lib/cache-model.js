'use strict';

var assign = require('lodash.assign');
var isObject = require('lodash.isobject');
var clone = require('lodash.clone');

function CacheModel() {
  this._attributes = {};
}

assign(CacheModel.prototype, {
  set: function (key, value) {
    var valueToSet = isObject(value) ? clone(value, true) : value;

    this._attributes[key] = valueToSet;
  },

  get: function (key) {
    return this._attributes[key];
  }
});

module.exports = CacheModel;
