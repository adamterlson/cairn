# Cairn

[![Build Status](https://travis-ci.org/adamterlson/cairn.svg?branch=master)](https://travis-ci.org/adamterlson/cairn)
[![npm version](https://badge.fury.io/js/cairn.svg)](https://badge.fury.io/js/cairn)

Enhanced styling for React Native that replaces the default `style={[styles.foo, styles.bar]}` sytnax with a simpler, yet more powerful, string-based spread syntax: `{...style('foo bar')}`.

Instead of trying to shim a CSS preprocessor, Cairn embraces the power ([and advantages](https://facebook.github.io/react-native/docs/style.html)) of JavaScript-based styling. 

Cairn plays well with [React StyleSheet](https://facebook.github.io/react-native/docs/stylesheet.html). See [Middleware](#style-prop-transformers-middleware)

Dependencies: None

## Advantages

1. **Component-specific stylesheets** - Create and apply styles right in your component which extend from a shared, global stylesheet.
2. **"Middleware"** - Add support for variables, call React's `StyleSheet.create` and more in an unobtrusive way.  Write your own!
3. **Parent-child entity relationships** - Get "specificity" in React Native by overriding parent entity types with child types which derive from them.
4. **Apply style hierarchies en-masse** - Using strings instead of arrays of object references, refer to the aforementioned child entities and get all the parent styles as well.
5. **Conditional selectors** - Conditionally apply specific styles using a `?` flag and a toogle boolean or hash of toggle values.
6. **Set arbitrary style-related component props** - (e.g. `underlayColor` and `source`) Use the `props` keyword in your stylesheet to set any component prop!

See [Background](#background) section for more details on why you should use Cairn.


## Install
```
npm install --save cairn
```

## Basic Usage

Define your global component styles that are reusable across your entire application...

```javascript
// styles.js

import { StyleSheet } from 'react-native';
import cairn from 'cairn';

export default cairn({
    first: {
      backgroundColor: 'red',

      child: {
        backgroundColor: 'blue'
      }
    },
    someImage: {
      props: {
        source: require('../someImage.png')
      },
      width: 100,
      height: 50
    }
}, (styles) => StyleSheet.create(styles));
```

...then, import those global styles and (optionally) extend/override them with component-specific styles before spreading them onto the components.

```jsx
// components/MyComponent.js

import React from 'react-native';
import globalStyles from '../styles';

const style = globalStyles.extend({
    second: {
      height: 100,
      width: 100
    },
    'first.child': {
        backgroundColor: 'purple'
    }
});

export default () => (
    <View>
        /* Equal to:
            <View
                style={[ 
                    globalStyles.first, 
                    globalStyles.first.child, 
                    style.first,
                    style.first.child,
                    style.second
                ]}  
            />
        */
        <View {...style('first.child second')} />

        /* Equal to:
            <Image
                style={[ 
                    globalStyles.someImage
                ]}
                source={require('../someImage.png')}
            />
        */
        <Image {...style('someImage') />
    </View>
);
```

See the Examples folder for more usage help.

## Style & Prop Transformers ("Middleware")

Cairn provides a chance to attach abitrary transformational "middleware" for your styles and props.  These are also used for every call to `extend`.

The following are transformers included with Cairn.  See [Creating Custom Transformers](#creating-custom-transformers).

- `compose(...transformers)` - Pass all transformers to be used and they will be called with the result of the former transformations in the order given.

- `variables({ foo: 10, bar: {} })` - Pass a list of variables which can be referenced in your sheet, e.g. `{ one: '$foo', two: '$bar' }`.  The variable values are used by ref in place of the variable string, e.g. `{ one: 10, two: {} }`.

```javascript
  import cairn, { compose, variables } from 'cairn';

  const vars = variables({ foo: 10, bar: 20 });

  cairn(
    {
      thing: {
        props: {
          bar: '$bar'
        },

        foo: '$foo'
      }
    }, 

    // Style transformers
    compose(
      vars, 
      (styles) => StyleSheet.create(styles)
    ),

    // Prop transformers
    vars
  );
```

# API

### `let style = cairn(stylesheet [, styleTransform, propTransform])`

Pass to `cairn` your stylesheet.  This **returns a new function** which is used to apply the styles to specific elements.

**Parameters**
* `stylesheet` - Object - The stylesheet of application styles.
* `styleTransform` - Function - Optional - Called with flattened styles with props removed.  Expected return: the styles to be used.
* `propTransform` - Function - Optional - Called with flattened props with styles removed.  Expected return: the props to be used.

### `let moduleStyle = style.extend(moduleStylesheet)`

Create a new style function with access to the module-specific stylesheet.  The returned selector function has access to the extended stylesheet in addition to the global.  **No modifications are made to the global styles**. Uses the global `styleTransform` function if defined.  **Returns function used precisely the same as `cairn` itself.**

**Parameters**
* `moduleStylesheet` - Object - The stylesheet of module styles.

```javascript
import { StyleSheet } from 'react-native';
import cairn from 'cairn';

// styles.js
const globalStyles = cairn({ ... }, (styles) => StyleSheet.create(styles));

// MyParentModule.js
const parentModuleStyles = globalStyles.extend({ ... });

// MyChildModule.js
const childModuleStyles = parentModuleStyles.extend({ ... });
```

>Usage of `parentModuleStyles` and `childModuleStyles` is precisely the same as `globalStyles`.  See [`style(selectors)`](#style-selectors) below.

### `style(selectors)`

Apply styles by passing a space-delimited string to `style`  (the function returned from `cairn`) and then spread the result onto a component.  Selected styles are appended in order with last item having precedence. Selectors without a style definition will be ignored.

> `style` returns an object containing all the properties it will set on the component, so if you do not wish to use the spread syntax, you can access and apply `style` and other props directly:
> `<TouchableHighlight style={style('foo').style} underlayColor={style('bar').underlayColor} />`.

#### Types of Selectors

**Basic: `style('foo')`**

Apply just the specified class by name.

**Hierarchy: `style('foo.bar.baz')`**

Apply an entire hierarchy of classes at once.  The above is equivalent to `style={[styles.foo, styles.foo.bar, styles.foo.bar.baz]}`.

**Conditional: `style('foo bar? baz?', toggle)`**

Conditionally apply a style based on the state of toggle.  If toggle is a boolean, the boolean's value will be used.  If an object is given, the corresponding key in the object will be used instead.  Map the class to a new property by defining the mapped key after the `?` operator: `foo?newName`.

```jsx
<Text {...style('p complete? error?', false)}>...</Text>

// or:
<Text {...style('p complete?name error?', { name: 'Bob', error: 'Too Short!' })}>...</Text>
```

**Inline: `style('foo', [{ color: 'red' }])`**

Sometimes necessary, inline styles can be appended via an array of inline styles or stylesheet references.  Not recommended.


### All Selector Types

```javascript
class MyView extends Component {
  render() {
    return (
      <View>
        <Text {...style('header')}>
          Primary Heading
        </Text>
        <Text {...style('header.secondary')}>
          Primary and Secondary Heading
        </Text>
        <Text {...style('error?', false)}>
           Never styled via 'error'
        </Text>
        <Text {...style('error?incomplete', {
          incomplete: true
        })}>
          Styled via 'error' if incomplete
        </Text>
        <Text {...style('header', [{
          color: 'red'
        }])}>
          Inline override. :(
        </Text>
      </View>
    );
  }
}
```

## Creating Custom Transformers

In order for Cairn to work unobtrusively with React's `StyleSheet.create` (and even some other enhanced-styling-features-related-libraries), all props must be separated from styles, flattened, and transformed separately.

### `transformer(stylesOrProps)`

```javascript
const styleTransformer = styles => {
  // styles ==> {
  //  'parent': {
  //    someParentStyle: 'value'
  //  },
  //  'parent.child': {
  //    someChildStyle: 'value'
  //  }
  // }
  return styles;
};
const propTransformer = props => {
  // props ==> {
  //  'parent': {
  //    someParentProp: 'value'
  //  },
  //  'parent.child': {
  //    someChildProp: 'value'
  //  }
  // }
  return props;
};
const styles = cairn({ 
  parent: {
    props: {
      someChildProp: 5
    },
    someParentStyle: 'value',

    child: {
      props: {
        someChildProp: 10
      }
      someChildStyle: 'value'
    }
  }
}, styleTransformer, propTransformer);
```

> The passed in props and styles objects should not themselves be modified.

The returned value from a transformer is what is actually made available to subsequent selector calls via `style` and ultimately applied to your components.


## Background

Styling in React Native is a mixed blessing.  On one hand you have the power of JS-driven styling which is superior in many ways.  There are some issues with it however:

### Composing styles with arrays

In React Native, there is no cascading of styles, so when you have multiple types of something, say a pageContainer, most will begin by styling each individually:

```javascript
{
  'pageContainer': {
    flex: 1,
    marginTop: 10,
    marginBottom: 10
  },
  'pageContainerWithHeader': {
    flex: 1,
    marginTop: 20
  },
  'pageContainerWithFooter': {
    flex: 1,
    marginBottom: 20
  },
  'pageContainerWithHeaderAndFooter': {
    flex: 1,
    marginTop: 20,
    marginBottom: 20
  }
}
....
<View style={styles.pageContainerWithHeaderAndFooter}>Body Text</View>
```

This can be improved upon by extracting out the common bits into their own classes and using an array of styles to apply instead:

```javascript
{
  'pageContainer': {
    flex: 1,
    marginTop: 10,
    marginBottom: 10
  },
  'pageContainerWithHeader': {
    marginTop: 20
  },
  'pageContainerWithFooter': {
    marginBottom: 20
  }
}
....
<View style={[
  styles.pageContainer,
  styles.pageContainerWithHeader,
  styles.pageContainerWithFooter ]}>
  Body Text
</View>
```

This is better, there's less redundancy in the styles, but the length of the class array can very quickly get out of hand when each bit of style is separated.  Additionally, there is a redundancy of "pageContainer" in the stylesheet.  What we need is a way to get the best of both worlds:

1) Be able to separate our stylesheet out into a set of parent types and child types that extend their parents, and

2) Reference this child type directly and get all the parent styling for free without having to compose it manually.


### Module-specific styles

In React Native, there is no support for a module-specific stylesheet.  Or no support for a global stylesheet.  You choose how to look at it.  It's possible to define two separate stylesheets and then, when applying styles to your component, select which stylesheet you wish to draw styles from or compose your styles array from both:

`<View styles={[ global.foo, componentSpecific.bar ]} />`

Or you could export just the JS object globally and extend it in your component when you call `StyleSheet.create`.

However, if you were to create such a system, there's no way to functionally extend/override styles, you simply need to apply them in order every time.  Take this to a third level and you see how unmanageable such a setup becomes.

Ideally we'd have a way to set default styles then simply extend them with modifiers and addtions specific to the module we're working on.


### Style-related props that cannot be set via `style=`

Some components in React Native define presentation attributes that cannot be set with the `styles` attribute, for example TouchableHighlight's `underlayColor`.  

In this example, in order to reference colors centralized in your stylesheet and then use them elsewhere on these components, you must export colors in addition to your stylesheet.  

Ideally we want the definition of styles in one place, regardless of what property on our component is being set.

...

Cairn addresses all of these issues!
