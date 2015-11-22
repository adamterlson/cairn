'use strict';

let cairn = require('../lib');
var expect = require('chai').expect;

describe('cairn', function () {
  let styles,
      pile,
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

    styles = cairn.style(sheet, { spread: false });
    pile = cairn.pile;
  });

  describe('style', function () {
    describe('spread syntax support', function () {
      it('should default to spread syntax', function () {
        styles = cairn.style(sheet);
        expect(styles('thingOne')).to.eql({ style: [sheet.thingOne]});
      });
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

      describe('selector hash', function () {
        it('should use the class name as a default key in the toggle hash', function () {
          expect(styles('thingOne?', { thingOne: false })).to.eql([]);
          expect(styles('thingOne?', { thingOne: true })).to.eql([thingOne]);
          expect(styles('thingOne? thingTwo?', { thingOne: true })).to.eql([thingOne]);
        });

        describe('renamed keys', function () {
          it('should toggle off based on the value of a specific hash', function () {
            expect(styles('thingOne?one', { one: false })).to.eql([]);
          });
          it('should toggle on based on the value of a specific hash', function () {
            expect(styles('thingOne?one thingTwo?two parent?parent', { one: true, two: false, parent: true })).to.eql([thingOne, parent]);
          });
          it('should blend renamed and default keys', function () {
            expect(styles('thingOne?one thingTwo? parent?', { one: true, thingTwo: true })).to.eql([thingOne, thingTwo]);
          });
          it('should rename dot notation syntax on', function () {
            expect(styles('parent.child.grandchild?newname', { newname: true })).to.eql([parent, child, grandchild]);
          });
          it('should rename dot notation syntax off', function () {
            expect(styles('parent.child.grandchild?newname', { newname: false })).to.eql([]);
          });
        });
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

    describe('inline styles', function () {
      it('should append on the array of inline styles at the end', function () {
        let inline1 = { color: 'red' };
        let inline2 = { color: 'blue' };
        expect(styles('thingOne', [inline1, inline2])).to.eql([thingOne, inline1, inline2]);
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
      })
    });

    it('should pile without a name prefix', function () {
      expect(pile(sheet)).to.eql({
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
      })
    });
  });
});
