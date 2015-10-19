'use strict';

let cairn = require('../index.js');
var expect = require('chai').expect;

describe('cairn', function () {
  let styles,
      sheet,
      thingOne = { fontSize: 10 },
      thingTwo = { fontSize: 20 },
      parent = { fontSize: 30 },
      child = { fontSize: 40 },
      grandchild = { fontSize: 50 };

  beforeEach(function () {
    sheet = {
      thingOne,
      thingTwo,
      parent,
      'parent.child': child,
      'parent.child.grandchild': grandchild
    };

    styles = cairn(sheet);
  });

  it('should select the appropriate styles for a single selector', function () {
    expect(styles('thingOne')).to.eql([sheet.thingOne]);
  });

  it('should select the appropriate as an array for space delimited selectors', function () {
    expect(styles('thingOne thingTwo')).to.eql([sheet.thingOne, sheet.thingTwo]);
  });

  describe('optional selectors', function () {
    it('should toggle keys conditional keys with a toggle false', function () {
      expect(styles('thingOne?', false)).to.eql([]);
    });

    it('should leave non-flagged keys alone with toggle false', function () {
      expect(styles('thingOne thingTwo?', false)).to.eql([thingOne]);
    });

    it('should include conditional keys with a toggle true', function () {
      expect(styles('thingOne thingTwo?', true)).to.eql([thingOne, thingTwo]);
    });

    it('should support toggling on entire dot notation chunk', function () {
      expect(styles('parent.child.grandchild?', true)).to.eql([parent, child, grandchild]);
    });

    it('should support toggling off entire dot notation chunk', function () {
      expect(styles('parent.child.grandchild?', false)).to.eql([]);
    });

    it('should toggle multiple selectors', function () {
      expect(styles('thingOne thingTwo? thingTwo? parent?', false)).to.eql([thingOne]);
    });
  });

  describe('dot notation syntax', function () {
    it('should include base type and additional classes for dot notation', function () {
      expect(styles('parent.child')).to.eql([parent, child]);
      expect(styles('parent.child.grandchild')).to.eql([parent, child, grandchild]);
    });

    it('should compose dot notation and regular without issue', function () {
      expect(styles('parent.child.grandchild thingOne')).to.eql([parent, child, grandchild, thingOne]);
    });
  });

  describe('bad selectors', function () {
    it('should remove undefined selector result from array', function () {
      expect(styles('thingOne invalid thingTwo')).to.eql([thingOne, thingTwo]);
    });

    it('should return empty array when given a single invalid selector', function () {
      expect(styles('invalid')).to.eql([]);
    });

    it('should apply all selectors possible preceeding an invalid selector', function () {
      expect(styles('parent.child.grandchild.invalid')).to.eql([parent, child, grandchild]);
    });

    it('should not apply selectors after an invalid one', function () {
      expect(styles('parent.child.invalid.grandchild')).to.eql([parent, child]);
    });
  });
});
