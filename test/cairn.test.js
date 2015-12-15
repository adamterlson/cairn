'use strict';

import cairn, { pile } from '../lib';


var expect = require('chai').expect;

describe('cairn', function () {
  let style,
      styles,
      sheet,
      thingOne = { fontSize: 10 },
      thingTwo = { fontSize: 20 },
      parent = { fontSize: 30 },
      child = { fontSize: 40 },
      grandchild = { fontSize: 50 },

      thingOneWithProps = { fontSize: 10, props: { underlayColor: 'red' }},
      thingTwoWithProps = { fontSize: 20, props: { overlayColor: 'blue' }},
      parentWithProps = { fontSize: 10, props: { underlayColor: 'red' }},
      childWithProps = { fontSize: 20, props: { overlayColor: 'blue' }},
      grandchildWithProps = { fontSize: 30, props: {
        overlayColor: 'black',
        highlightColor: 'purple'
      }};

  beforeEach(function () {
    sheet = {
      thingOne,
      thingTwo,
      parent,
      'parent.child': child,
      'parent.child.grandchild': grandchild
    };

    style = cairn(sheet);
  });

  describe('style', function () {
    it('should select the appropriate styles for a single selector', function () {
      expect(style('thingOne')).to.eql({ style: [thingOne] });
    });

    it('should select the appropriate as an array for space delimited selectors', function () {
      expect(style('thingOne thingTwo')).to.eql({ style: [thingOne, thingTwo] });
    });

    describe('optional selectors', function () {
      it('should toggle keys conditional keys with a toggle false', function () {
        expect(style('thingOne?', false)).to.eql({ style: [] });
      });

      it('should leave non-flagged keys alone with toggle false', function () {
        expect(style('thingOne thingTwo?', false)).to.eql({ style: [thingOne] });
      });

      it('should include conditional keys with a toggle true', function () {
        expect(style('thingOne thingTwo?', true)).to.eql({ style: [thingOne, thingTwo] });
      });

      it('should support toggling on entire dot notation chunk', function () {
        expect(style('parent.child.grandchild?', true)).to.eql({ style: [parent, child, grandchild] });
      });

      it('should support toggling off entire dot notation chunk', function () {
        expect(style('parent.child.grandchild?', false)).to.eql({ style: [] });
      });

      it('should toggle multiple selectors', function () {
        expect(style('thingOne thingTwo? thingTwo? parent?', false)).to.eql({ style: [thingOne] });
      });

      describe('selector hash', function () {
        it('should use the class name as a default key in the toggle hash', function () {
          expect(style('thingOne?', { thingOne: false })).to.eql({ style: [] });
          expect(style('thingOne?', { thingOne: true })).to.eql({ style: [thingOne] });
          expect(style('thingOne? thingTwo?', { thingOne: true })).to.eql({ style: [thingOne] });
        });

        describe('renamed keys', function () {
          it('should toggle off based on the value of a specific hash', function () {
            expect(style('thingOne?one', { one: false })).to.eql({ style: [] });
          });
          it('should toggle on based on the value of a specific hash', function () {
            expect(style('thingOne?one thingTwo?two parent?parent', { one: true, two: false, parent: true })).to.eql({ style: [thingOne, parent] });
          });
          it('should blend renamed and default keys', function () {
            expect(style('thingOne?one thingTwo? parent?', { one: true, thingTwo: true })).to.eql({ style: [thingOne, thingTwo] });
          });
          it('should rename dot notation syntax on', function () {
            expect(style('parent.child.grandchild?newname', { newname: true })).to.eql({ style: [parent, child, grandchild] });
          });
          it('should rename dot notation syntax off', function () {
            expect(style('parent.child.grandchild?newname', { newname: false })).to.eql({ style: [] });
          });
        });
      });
    });

    describe('dot notation syntax', function () {
      it('should include base type and additional classes for dot notation', function () {
        expect(style('parent.child')).to.eql({ style: [parent, child] });
        expect(style('parent.child.grandchild')).to.eql({ style: [parent, child, grandchild] });
      });

      it('should compose dot notation and regular without issue', function () {
        expect(style('parent.child.grandchild thingOne')).to.eql({ style: [parent, child, grandchild, thingOne] });
      });
    });

    describe('bad selectors', function () {
      it('should remove undefined selector result from array', function () {
        expect(style('thingOne invalid thingTwo')).to.eql({ style: [thingOne, thingTwo] });
      });

      it('should return empty array when given a single invalid selector', function () {
        expect(style('invalid')).to.eql({ style: [] });
      });

      it('should apply all selectors possible preceeding an invalid selector', function () {
        expect(style('parent.child.grandchild.invalid')).to.eql({ style: [parent, child, grandchild] });
      });

      it('should not apply selectors after an invalid one', function () {
        expect(style('parent.child.invalid.grandchild')).to.eql({ style: [parent, child] });
      });
    });

    describe('inline styles', function () {
      it('should append on the array of inline styles at the end', function () {
        let inline1 = { color: 'red' };
        let inline2 = { color: 'blue' };
        expect(style('thingOne', [inline1, inline2])).to.eql({ style: [thingOne, inline1, inline2] });
      });
    });

    describe('top level props', function () {
      beforeEach(function () {
        sheet = {
          'thingOneWithProps': thingOneWithProps,
          'thingTwoWithProps': thingTwoWithProps,
          'parent': parentWithProps,
          'parent.child': childWithProps,
          'parent.child.grandchild': grandchildWithProps
        };
        style = cairn(sheet);
      });
      it('should return props defined as a top-level peer to style', function () {
        expect(style('parent')).to.eql({
          style: [{
            fontSize: 10
          }],
          underlayColor: 'red'
        });
      });
      it('should merge props from child to parent', function () {
        expect(style('parent.child')).to.eql({
          style: [{
            fontSize: 10
          },{
            fontSize: 20
          }],
          underlayColor: 'red',
          overlayColor: 'blue',
        });
      });
      it('should override parent props with that of the child', function () {
        expect(style('parent.child.grandchild')).to.eql({
          style: [{
            fontSize: 10
          },{
            fontSize: 20
          },{
            fontSize: 30
          }],
          underlayColor: 'red',
          overlayColor: 'black',
          highlightColor: 'purple'
        });
      });
      it('should apply multiple class props', function () {
        expect(style('thingOneWithProps thingTwoWithProps')).to.eql({
          style: [{
            fontSize: 10
          },{
            fontSize: 20
          }],
          underlayColor: 'red',
          overlayColor: 'blue'
        });
      });
      it('should skip optional classes that are toggled off in the application of props', function () {
        expect(style('thingOneWithProps? thingTwoWithProps', false)).to.eql({
          style: [{
            fontSize: 20
          }],
          overlayColor: 'blue'
        });
      });
    });
  });

  describe('pile', function () {
    beforeEach(function () {
      sheet = {
        uncle: {
          fontSize: 10
        },
        aunt: {
          fontSize: 20,

          cousin: {
            color: 'red'
          }
        },
        parent: {
          fontSize: 30,

          child: {
            color: 'blue',

            grandchild: {
              flex: 1
            }
          },

          problemChild: {
            transform: [{ scale: 1 }],
            shadowOffset: { height: 1, width: 0 }
          }
        }
      };
    });

    it('should pile with a name prefix', function () {
      expect(pile('foo', sheet)).to.eql({
        props: { },
        styles: {
          'foo.uncle': {
            fontSize: 10
          },
          'foo.aunt': {
            fontSize: 20
          },
          'foo.aunt.cousin': {
            color: 'red'
          },
          'foo.parent': {
            fontSize: 30
          },
          'foo.parent.child': {
            color: 'blue'
          },
          'foo.parent.child.grandchild': {
            flex: 1
          },
          'foo.parent.problemChild': {
            transform: [{ scale: 1 }],
            shadowOffset: { height: 1, width: 0 }
          }
        }
      })
    });

    it('should pile without a name prefix', function () {
      expect(pile(sheet)).to.eql({
        props: { },
        styles: {
          'uncle': {
            fontSize: 10
          },
          'aunt': {
            fontSize: 20
          },
          'aunt.cousin': {
            color: 'red'
          },
          'parent': {
            fontSize: 30
          },
          'parent.child': {
            color: 'blue'
          },
          'parent.child.grandchild': {
            flex: 1
          },
          'parent.problemChild': {
            transform: [{ scale: 1 }],
            shadowOffset: { height: 1, width: 0 }
          }
        }
      })
    });

    describe('with props', function () {
      beforeEach(function () {
        sheet = {
          childWithProps: {
            props: {
              underlayColor: 'blue'
            },

            grandchildWithProps: {
              props: {
                underlayColor: 'red'
              },

              color: 'red'
            }
          }
        };
      });

      it('should compile props separately from styles', function () {
        expect(pile(sheet)).to.eql({
          styles: {
            'childWithProps': {},
            'childWithProps.grandchildWithProps': {
              color: 'red'
            }
          },
          props: {
            'childWithProps': { underlayColor: 'blue' },
            'childWithProps.grandchildWithProps': {
              underlayColor: 'red'
            }
          }
        })
      });
    });
  });
});
