[![Build Status](https://travis-ci.org/adamterlson/cairn.svg?branch=master)](https://travis-ci.org/adamterlson/cairn)
# Cairn
Cairn is a tiny library for React Native that replaces the default `styles={[styles.foo, styles.bar]}` styling sytnax with a simpler string-based spread syntax: `{...style('foo bar')}`.  Cairn supports defining multiple classes, applying hierarchically-defined classes en masse, and conditional classes.

If you're not sure why you want this, check out the [Background](#background) section.

## Getting Started
```
npm install --save cairn
```

```
let cairn = requrie('cairn');
let style = cairn({ ... });
...
<View {...style(' ... ')} />
```

### `cairn(stylesheet [, styleTransform])`
Pass to `cairn` your stylesheet.  This **returns a new function** which is used to apply the styles to specific elements.  This is essentially equivalent to `cairn.style(cairn.pile(stylesheet))`.

**styleTransform** - `function(styles)` - Optional - Called with flattened styles with props removed.  Expected return: the styles to be used.  This is a hook for calling `StyleSheet.create`.

### Applying Styles - `style(...)`

Apply classes by passing a space-delimited string to `style` which is the function returned from both `cairn` and `cairn.style` (where the former first calls `pile` for you while the latter does not).  Classes are appended in order with last item having precedence.  Invalid class names will be ignored with a warning.  All types of styles can be used simultaneously.

This function returns an object (`{ styles: [...], [custom props] }`) which can then be spread onto your component: `<View {...styles('foo')}`.

#### Selector Types

**Basic: `style('foo')`**

Apply just the specified class by name.

**Piled Hierarchy: `style('foo.bar.baz')`**

Apply an entire hierarchy of classes at once.  The above is equivalent to `style={[styles.foo, styles.foo.bar, styles.foo.bar.baz]}`.  

See how to create piled stylesheets in the section below.

**Conditional: `style('foo bar? baz?', toggle)`**

Conditionally apply a style based on the state of toggle.  If toggle is a boolean, the boolean's value will be used.  If an object is given, the corresponding key in the object will be used instead.  Map the class to a new property by defining the mapped key after the `?` operator: `foo?newName`.

```
<Text {...style('p complete?name error?', { name: 'Bob', error: 'Too Short!' })}>...</Text>
```

**Inline: `style('foo', [{ color: 'red' }])`**

Sometimes necessary, inline styles can be appended via an array of inline styles or stylesheet references.  Not recommended.


```javascript
import { Text, StyleSheet, Component } from 'react-native';
import cairn from 'cairn';

let sheet = {
  'header': {
    fontWeight: 'bold',
    fontSize: 30
  },
  // Using `pile`, this can be a nested object
  // but without, it must be explicitly named
  'header.secondary': {
    fontSize: 20
  },
  'error': {
    fontStyle: 'italic'
  }
};

let style = cairn(sheet, (styles) => StyleSheet.create(styles));

class MyView extends Component {
  render() {
    return (
      <Text {...style('header')}>Primary Heading</Text>
      <Text {...style('header.secondary')}>Secondary Heading</Text>
      <Text {...style('error?incomplete', { incomplete: true })}>Error Text</Text>
    );
  }
}
````

### Piled Stylesheets
The stylesheet object passed to the `cairn` factory function is passed on to `cairn.pile` for you, but can be used directly via `cairn.pile({})`.  Pile adds support for the nesting of objects and definining custom props.

#### Nested Objects
Using a nested object defines a parent-child relationship for later en-masse style application.  This is equivalent to naming your classes with dots, as above ('header.secondary').   Child styles take precedence and override parent style definitions.

#### Custom Props
Use the keyword `props` to define presentation attributes besides `styles`. Child props take precedence, just like styles.

There are many React Native components that use properties other than `styles` for presentation (e.g.  `TouchableHighlight`'s underlayColor).  You can define all these presentation attributes in one place by using `props`.

### Example

````javascript
import { View, Text, StyleSheet, Component } from 'react-native';
import cairn from 'cairn';

const colors = { blue: 'blue', gray: 'gray', red: 'red' };

let style = cairn({
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
    }
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

class MyView extends React.Component {
  render() {
    return (
      <View>
        <!-- text, header, header.h1, header.h1.user -->
        <Text {...style('text.header.h1.user')}>Primary User Header Text</Text>

        <!-- text, header, header.h2 -->
        <Text {...style('text.header.h2')}>Secondary Header Text</Text>

        <!-- button, button.user -->
        <TouchableHighlight {...style('button')} onPress={() => {}}>
          <!-- text, text.button -->
          <Text {...style('text.button')}>Button Text</Text>
        </TouchableHighlight>
      </View>
    );
  }
}
````


## Background
In React Native, there is no cascading of styles, so when you have multiple types of something, say a pageContainer, most will begin by styling each individually:

````javascript
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
````

This can be improved upon by extracting out the common bits into their own classes and using an array of styles to apply instead:

````
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
````

This is better, there's less redundancy in the styles, but the length of the class array can very quickly get out of hand when each bit of style is separated.  Additionally, there is a redundancy of "pageContainer" in the stylesheet.  What we need is a way to get the best of both worlds:

1) Be able to separate our stylesheet out into a set of parent types and child types that extend their parents, and

2) Reference this child type directly and get all the parent styling for free without having to compose it manually

Additionally, some components define presentation attributes outside of `styles`, for example TouchableHighlight's `underlayColor`.  In order to reference colors defined and used elsewhere in your stylesheet on these components, your file must additionally export colors.  This is an inconvenience, so it'd be nice if our solution to the above included the ability to merge the definition of presentation with its application.

Cairn does all of this!
