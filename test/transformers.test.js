'use strict';

import { compose, functional, variables } from '../src';

const expect = require('chai').expect;

describe('cairn transformers', function () {

  describe('compose', function () {
    const startingPoint = {
      parent: 'parent',
      child: {
        thing: 'thing'
      }
    };
    const nester = arg => ({ nested: arg });
    const prepender = arg => Object.keys(arg).reduce((obj, key) => {
      obj['prepend' + key] = arg[key];
      return obj
    }, {});
    const noop = arg => arg;

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

    it('should compose the compose', function () {
      expect(compose(compose(prepender, nester), compose(nester, noop, compose(prepender)))(startingPoint))
        .to.eql({
          prependnested: {
            nested: {
              prependparent: 'parent',
              prependchild: {
                thing: 'thing'
              }
            }
          }
        })
    });
  });

  describe('variables', function () {
    it('should replace variables with values by ref when no other characters are present', function () {
      const jazz = { j: 'azz' };
      const jack = () => {};

      const result = variables({
        foo: 10,
        bar: 'something',
        jazz: jazz,
        jack: jack,
        falsy: 0,
        bool: false
      })({
        thing: {
          foo: '$foo',
          bar: '$bar',
          jazz: '$jazz',
          jack: '$jack',
          falsy: '$falsy',
          bool: '$bool'
        }
      });

      expect(result).to.eql({
        thing: {
          foo: 10,
          bar: 'something',
          jazz: jazz,
          jack: jack,
          falsy: 0,
          bool: false
        }
      });
    });

    it('should leave unknown vars alone', function () {
      const result = variables({})({
        thing: {
          unknown: '$unknown',
          unknown2: '$unknown2'
        }
      });

      expect(result).to.eql({
        thing: {
          unknown: '$unknown',
          unknown2: '$unknown2'
        }
      });
    });

    it('should replace as part of a string if the variable is not the entire thing', function () {
      const result = variables({
        foo: 10
      })({
        thing: {
          foo: 'some$foo%'
        }
      });

      expect(result).to.eql({
        thing: {
          foo: 'some10%'
        }
      })
    });

    it('should throw if no variables are given', function () {
      expect(() => variables()).to.throw('No variables provided');
    });

    it('should leave things without variables alone', function () {
      const sheet = {
        thing: {
          no: 'variable',
          nothing: { at: 'all' }
        }
      }
      const result = variables({
        foo: 10
      })(sheet);

      expect(result).to.eql(sheet);
    });
  });
});