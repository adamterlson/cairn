'use strict';

import { compose } from '../src';

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

  describe('compose', function () {
    it('should return the sum of all transformations', function () {
      expect(compose(prepender, nester)(startingPoint)).to.eql({
        nested: {
          prependparent: 'parent',
          prependchild: {
            thing: 'thing'
          }
        }
      });
    });

    it('should throw if no transformers are given', function () {
      expect(() => compose()).to.throw('No transformers provided');
    });
  })
});