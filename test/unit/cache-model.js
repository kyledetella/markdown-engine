var expect = require('chai').expect;
var CacheModel = require('../../lib/cache-model');

describe('CacheModel', function () {
  beforeEach(function () {
    this.cm = new CacheModel();
  });

  afterEach(function () {
    this.cm = null;
  });

  describe('constructor', function () {
    it('creates a default _attributes object', function () {
      var cm = new CacheModel();
      expect(CacheModel.prototype._attributes).not.to.be.defined;
      expect(cm._attributes).to.deep.equal({});
    });
  });

  describe('set', function () {
    it('sets key:value on internal _attributes', function () {
      this.cm.set('foo', 'bar');
      expect(this.cm._attributes.foo).to.equal('bar');
    });

    it('overrides previous value', function () {
      this.cm.set('bar', 'baz');
      this.cm.set('bar', 'foo');

      expect(this.cm._attributes.bar).to.equal('foo');
    });

    it('sets a copy of an object', function () {
      var obj = {foo: 'bar'};

      this.cm.set('foo', obj);

      obj.foo = 'noo';

      expect(this.cm._attributes.foo).to.deep.equal({foo: 'bar'});
    });

    it('sets a deep copy of an object', function () {
      var obj = {foo: 'bar', baz: {qux: 'bif'}};

      this.cm.set('foo', obj);

      obj.baz.qux = 'mux';

      expect(this.cm._attributes.foo.baz).to.deep.equal({qux: 'bif'});
    });
  });

  describe('get', function () {
    it('returns value for given key', function () {
      this.cm.set('foo', {bar: 'baz'});

      expect(this.cm.get('foo')).to.deep.equal({bar: 'baz'});
    });

    it('returns undefined for non-existeny key', function () {
      expect(this.cm.get('foo')).to.equal(undefined);
    });
  });
});
