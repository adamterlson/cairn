'use strict';

import { combineTransformers } from '../lib';

const expect = require('chai').expect;

describe('cairn transformers', function () {
  let startingPoint = {
    parent: 'parent',
    child: {
      thing: 'thing'
    }
  };

  let nester = arg => ({ nested: arg });
  let prepender = arg => Object.keys(arg).reduce((obj, key) => {
    obj['prepend' + key] = arg[key];
    return obj
  }, {});
  let noop = arg => arg;
  let replacer = arg => Object.keys(arg).reduce((key, obj) => {
    obj[key] = 'replaced';
    return obj;
  }, {});

  describe('combineTransformers', function () {
    it('should return the sum of all transformations', function () {
      expect(combineTransformers(prepender, nester)(startingPoint)).to.eql({
        nested: {
          prependparent: 'parent',
          prependchild: {
            thing: 'thing'
          }
        }
      });
    });

    it('should throw if no transformers are given', function () {
      expect(() => combineTransformers()).to.throw('No transformers provided');
    });
  })
});