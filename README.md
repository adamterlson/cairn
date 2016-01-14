[![Build Status](https://travis-ci.org/adamterlson/cairn.svg?branch=master)](https://travis-ci.org/adamterlson/cairn)
# Cairn
Cairn is a tiny library for React Native that replaces the default `styles={[styles.foo, styles.bar]}` styling sytnax with a simpler, string-based spread syntax: `{...style('foo bar')}`.  Cairn supports defining multiple classes, applying hierarchically-defined classes en masse, and conditional classes.

Instead of trying to shim a CSS preprocessor, Cairn embraces the power ([and advantages](https://facebook.github.io/react-native/docs/style.html)) of JavaScript-based styling.  Cairn plays well with [React StyleSheet](https://facebook.github.io/react-native/docs/stylesheet.html).

If you're not sure why you want this, check out the [Background](#background) section.

Cairn has no dependencies.

## Install
```
npm install --save cairn
```

## Basic Usage

```
let cairn = requrie('cairn');
let style = cairn({
    first: {
      backgroundColor: 'red',

      child: {
        backgroundColor: 'blue'
      }
    },
    second: {
      height: 100,
      width: 100
    },
    someImage: {
      props: {
        source: require('../someImage.png')
      },
      width: 100,
      height: 50
    }
});
...
<!-- Will be blue and 100x100  -->
<View {...style('first.child second')} />

<!-- Will have source prop of someImage.png and 100x50 -->
<Image {...style('someImage') />
```


## Cairn Stylesheets
Passing your stylesheets first through Cairn has two major advantages over using React Native's styling directly:

#### 1) Nested Objects
Using a nested object sets up a parent-child relationship for en-masse style application (see API/examples).  Child styles and props extend (and override) those of their parent(s).

#### 2) Custom Props
Use the keyword `props` to define presentation attributes besides `styles`. Child props take precedence, just like styles.

> There are many React Native components that use properties other than `styles` for presentation (e.g.  `TouchableHighlight`'s underlayColor).  You can define these presentation-related attributes in your stylesheet by using `props`.

### Stylesheet Definition
To create your stylesheet, pass an object containing your styles to `cairn` and an optional second parameter containing a style transformer.

```javascript
// styles.js
import { StyleSheet } from 'react-native';
import cairn from 'cairn';

const colors = { blue: 'blue', gray: 'gray', red: 'red' };

export default cairn({
  text: {
    fontFamily: 'Cochin',
    color: colors.gray,

    header: {
      fontFamily: 'Georgia',
      textDecorationLine: 'underline',

      h1: {
        fontSize: 30,

        user: {
          color: 'red'
        }
      },

      h2: { fontSize: 20 }
    },

    button: {
      textAlign: 'center'
    }
  },
  logo: {
  	props: {
  	  source: require('../images/logo.png')
  	},
  	width: 100,
  	height: 40
  },
  button: {
    props: {
      underlayColor: colors.gray
    },
    backgroundColor: colors.blue,

    user: {
      props: {
        underlayColor: colors.red
      }
    }
  }
}, (styles) => StyleSheet.create(styles));
```

### Cairn Selectors
Apply your styles in a simple, yet powerful way using strings instead of arrays of object references.

For more information the different types of selectors Cairn supports (Basic, Hierarchical, and Conditional) see the [API section](#styleselectors) below.

```javascript
// MyComponent.js
import React, { View, Text, TouchableHighlight, Image } from 'react-native';
import style from './styles.js';

class MyComponent extends React.Component {
  render() {
    return (
      <View>
      	<!-- logo -->
      	<Image {...style('logo')} />
      	
        <!-- text, text.header, text.header.h1, text.header.h1.user -->
        <Text {...style('text.header.h1.user')}>Primary User Header Text</Text>

        <!-- text, text.header, text.header.h2 -->
        <Text {...style('text.header.h2')}>Secondary Header Text</Text>

        <!-- button, button.user -->
        <TouchableHighlight {...style('button.user')} onPress={() => {}}>
          <!-- text, text.button -->
          <Text {...style('text.button')}>Button Text</Text>
        </TouchableHighlight>
      </View>
    );
  }
}
```
> `style` returns an object containing all the properties it will set on the component, so if you do not wish to use the spread syntax, you can access and apply `styles` and other directly:
> `<TouchableHighlight styles={style('foo').styles} underlayColor={styles('foo').underlayColor} />`.

## API

### `let style = cairn(stylesheet [, styleTransform])`

Pass to `cairn` your stylesheet.  This **returns a new function** which is used to apply the styles to specific elements.

**Parameters**
* `stylesheet` - Object - The stylesheet of application styles.
* `styleTransform` - Function - Optional - Called with flattened styles with props removed.  Expected return: the styles to be used.  This is a hook for calling `StyleSheet.create`.

### `style(selectors)`

Apply styles by passing a space-delimited string to `style`  (the function returned from `cairn`) and then spread the result onto a component.  Selected styles are appended in order with last item having precedence. Selectors without a style definition will be ignored with a warning.

#### Types of Selectors

**Basic: `style('foo')`**

Apply just the specified class by name.

**Hierarchy: `style('foo.bar.baz')`**

Apply an entire hierarchy of classes at once.  The above is equivalent to `style={[styles.foo, styles.foo.bar, styles.foo.bar.baz]}`.

**Conditional: `style('foo bar? baz?', toggle)`**

Conditionally apply a style based on the state of toggle.  If toggle is a boolean, the boolean's value will be used.  If an object is given, the corresponding key in the object will be used instead.  Map the class to a new property by defining the mapped key after the `?` operator: `foo?newName`.

```
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

## Background
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

2) Reference this child type directly and get all the parent styling for free without having to compose it manually

Additionally, some components define presentation attributes outside of `styles`, for example TouchableHighlight's `underlayColor`.  In order to reference colors defined and used elsewhere in your stylesheet on these components, you must export colors in addition to your stylesheet.  This is an inconvenience, ideally we'd want the definition of presentation in one place, regardless of what attribute on our component is being set.

Cairn does all of this!
