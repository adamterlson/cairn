'use strict';

import cairn, { mergedStyle, pile } from '../src';

const expect = require('chai').expect;

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
        }},

        propsOnly = {
            props: { underlayColor: 'red' }
        };

    beforeEach(function () {
        sheet = {
            thingOne,
            thingTwo,
            parent,
            'parent.child': child,
            'parent.child.grandchild': grandchild,
            propsOnly
        };

        style = cairn(sheet);
    });

    describe('factory', function () {
        it('should call return a piled sheet', function () {
            let nested = { parent: { child: { attr: 10 } } };
            expect(cairn(nested)('parent.child')).to.eql({ style: [{ attr: 10 }] });
        });

        describe('styles transformer', function () {
            it('should not transform if argument is null', function () {
                let style = cairn({ a: { b: 'b' } }, null);

                expect(style('a')).to.eql({ style: [{ b:'b' }] });
            });
            it('should transform styles', function () {
                let style = cairn({ a: { b: 'b' } }, (styles) => { 
                    expect(styles).to.eql({ a: { b: 'b' } });
                    return { 'c.d': 'e' };
                });

                expect(style('c.d')).to.eql({ style: ['e'] });
            });
        });

        describe('props transformer', function () {
            it('should not transform if argument is null', function () {
                let style = cairn({ a: { props: { b: 'b' } } }, null, null);

                expect(style('a')).to.eql({ style: [], b: 'b' });
            });

            it('should transform props', function () {
                let style = cairn({ a: { props: { b: 'b' }}}, null, (props) => { 
                    expect(props).to.eql({ a: { b: 'b' } });
                    return { 'c.d': { e: 'e' } };
                });

                expect(style('c.d')).to.eql({ e: 'e', style: [] });
            });
        });

        describe('styles and props transformer', function () {
            it('should transform all the things', function () {
                let stylesTransformer = styles => ({ c: { d: 'd' } });
                let propsTransformer = props => ({ c: { f: 'f' } });

                let style = cairn({}, stylesTransformer, propsTransformer);

                expect(style('c')).to.eql({ style: [{d:'d'}], f: 'f' })
            });
        });
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

            it('should toggle true for string values', function () {
              expect(style('thingOne thingTwo?', 'string')).to.eql({ style: [thingOne, thingTwo] });
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

        describe('selector cache', function () {
            it('should return the same array reference for the same simple selectors', function () {
                expect(style('thingOne thingTwo').style).to.equal(style('thingOne thingTwo').style);
            });

            it('should return the same array reference for the same optional selector activations', function () {
                expect(style('thingOne thingTwo? thingTwo? parent?', false).style).to.equal(style('thingOne thingTwo? thingTwo? parent?', false).style);
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
                        shadowOffset: { height: 1, width: 0 },
                        textShadowOffset: { height: 0, width: 1 }
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
                        shadowOffset: { height: 1, width: 0 },
                        textShadowOffset: { height: 0, width: 1 }
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
                        shadowOffset: { height: 1, width: 0 },
                        textShadowOffset: { height: 0, width: 1 }
                    }
                }
            })
        });

        describe('empty parent', function () {
            it('should strip empty parents', function () {
                expect(pile({ parent: { child: { attr: 10 } } })).to.eql({
                    props: {},
                    styles: {
                        'parent.child': {
                            attr: 10
                        }
                    }
                });
            });
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

            it('should bomb if the props defines styles', function () {
                expect(() => {
                    pile({
                        foo: {
                            props: {
                                styles: {
                                    bar: 'bar'
                                }
                            }
                        }
                    });
                }).to.throw('Invalid `props` definition');
            });
        });
    });

    describe('extend', function () {
        let extended,
            extendedThingOne = { fontSize: 20 },
            extendedThingTwo = { fontSize: 40 },
            extendedParent = { fontSize: 50 },
            extendedChild = { fontSize: 60 },
            extendedThingOneWithProps = { fontSize: 10, props: { underlayColor: 'extended' }},
            extendedThingTwoWithProps = { fontSize: 20, props: { additional: 'extended' }},
            extendedParentWithProps = { fontSize: 10, props: { underlayColor: 'red' }},
            extendedChildWithProps = { fontSize: 20, props: { overlayColor: 'blue' }},
            extendedGrandchildWithProps = { fontSize: 30, props: {
                overlayColor: 'black',
                highlightColor: 'purple'
            }};

        beforeEach(function () {
            extended = style.extend({
                thingOne: extendedThingOne,
                thingTwo: extendedThingTwo,
                parent: extendedParent,
                'parent.child': extendedChild,
            });
        });

        it('should return a contextualized selector that overrides global styles with the extended one', function () {
            expect(extended('thingOne')).to.eql({ style: [thingOne, extendedThingOne] });
            expect(extended('thingTwo')).to.eql({ style: [thingTwo, extendedThingTwo] });
            expect(extended('parent')).to.eql({ style: [parent, extendedParent] });
            expect(extended('parent.child')).to.eql({ style: [parent, child, extendedParent, extendedChild] });
        });

        it('should apply extended styles after, even if specific selector is missing', function () {
            expect(extended('parent.child.grandchild')).to.eql({ style: [parent, child, grandchild, extendedParent, extendedChild] });
        });

        describe('with props', function () {
            beforeEach(function () {
                style = cairn({
                    foo: {
                        bar: {
                            props: {
                                prop: 'value'
                            },
                            height: 10
                        },

                        height: 15
                    },
                    bar: {
                        props: {
                            prop: 'value'
                        },
                        height: 20
                    }
                }).extend({
                    foo: {
                        bar: {
                            props: {
                                newprop: 'extendedvalue'
                            },
                            width: 10
                        },

                        width: 15
                    },
                    bar: {
                        props: {
                            prop: 'newvalue'
                        },
                        width: 20
                    }
                });
            });

            it('should override props from the extended properties over the base', function () {
                expect(style('bar').prop).to.eql('newvalue');
            });

            it('should extend props from the extended sheet onto the base', function () {
                expect(style('foo.bar').prop).to.eql('value');
                expect(style('foo.bar').newprop).to.eql('extendedvalue');
            });

            it('should extend style attributes', function () {
                expect(style('bar').style).to.eql([{ height: 20 }, { width: 20 }]);
                expect(style('foo.bar').style).to.eql([{ height: 15 }, { height: 10 }, { width: 15 }, { width: 10 }]);
            });

            it('should append on the array of inline styles at the end', function () {
                let inline1 = { color: 'red' };
                let inline2 = { color: 'blue' };
                expect(style('bar', [inline1, inline2]).style).to.eql([{ height: 20 }, { width: 20 }, inline1, inline2]);
            });
        });

        describe('with transformers', function () {
            it('should call the transformers once for every extend', function () {
                let styleCalls = [];
                let propCalls = [];

                let base = { base: { baseBar: 'baseBar', props: { baseFoo: 'baseFoo' } } };
                let extend1 = { extend1: { extend1Bar: 'extend1Bar', props: { extend1Foo: 'extend1Foo' } } };
                let extend2 = { extend2: { extend2Bar: 'extend2Bar', props: { extend2Foo: 'extend2Foo' } } };

                let stylesTransformer = (styles) => styleCalls.push(styles);
                let propsTransformer = (props) => propCalls.push(props);

                style = cairn(base, stylesTransformer, propsTransformer).extend(extend1).extend(extend2);

                expect(styleCalls).to.eql([{base:{baseBar:'baseBar'}}, {extend1:{extend1Bar:'extend1Bar'}}, {extend2:{extend2Bar:'extend2Bar'}}]);
                expect(propCalls).to.eql([{base:{baseFoo:'baseFoo'}}, {extend1:{extend1Foo:'extend1Foo'}}, {extend2:{extend2Foo:'extend2Foo'}}]);
            });
        });
    });
});
