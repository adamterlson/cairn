[![Build Status](https://travis-ci.org/adamterlson/cairn.svg?branch=master)](https://travis-ci.org/adamterlson/cairn)
# Cairn
Cairn is a tiny library for React Native that replaces the default `styles={[styles.foo, styles.bar]}` styling sytnax with a simpler string-based spread syntax: `{...style('foo bar')}`.  Cairn supports defining multiple classes, applying hierarchically-defined classes en masse, and conditional classes.

If you're not sure why you want this, check out the [Background](#background) section.

## Getting Started
```
npm install --save cairn
```

```
let cairn = require('cairn');
let stylesheet = cairn.pile({ ... });
let style = cairn.style(stylesheet);
...
<View {...style('...')} />
```

## Applying Styles - `cairn.style`
Pass to `cairn.style` your React Native Stylesheet or object containing styles and options.  **Important** this returns another function.  User this to apply the styles to elements.

```
let style = cairn.style(stylesheet [, options]);
<View {...style('...')} />
```
**Available Options**

`spread` (default: true): Enable/disable spread syntax. If false, use `style={style('foo')}`.


#### Types of Styles
Apply multiple classes by passing a space-delimited string.  Classes are appended in order with last item having precedence.  Invalid class names will be ignored with a warning.  All types of styles can be used simultaneously.

**Basic: `...style('foo')`**

Apply just the specified class by name.

**Hierarchy: `...style('foo.bar.baz')`**

Apply an entire hierarchy of classes at once.  The above is equivalent to `style={[styles.foo, styles.foo.bar, styles.foo.bar.baz]}`.  

See Style Hierarchies section below.

**Conditional: `...style('foo bar? baz?', toggle)`**

Conditionally apply a style based on the state of toggle.  If toggle is a boolean, the boolean's value will be used.  If an object is given, the corresponding key in the object will be used instead.  Map the class to a new property by defining the mapped key after the `?` operator: `foo?newName`.

```
<Text {...style('p complete?name error?', { name: 'Bob', error: 'Too Short!' })}>...</Text>
```

**Inline: `...style('foo', [{ color: 'red' }])`**

Sometimes necessary for animations, inline styles can be appended via an array of inline styles or stylesheet references.  Not recommended generally.


```javascript
let React = require('react-native');
let cairn = require('cairn');
let { Text, StyleSheet } = React;
let sheet = StyleSheet.create({
  'header': {
    fontWeight: 'bold',
    fontSize: 30
  },
  'header.secondary': {
    fontSize: 20
  },
  'error': {
    fontStyle: 'italic'
  }
});
let style = cairn.style(sheet);

class MyView extends React.Component {
  render() {
    return (
      <Text {...style('header')}>Primary Heading</Text>
      <Text {...style('header.secondary')}>Secondary Heading</Text>
      <Text {...style('error?incomplete', { incomplete: true })}>Error Text</Text>
    );
  }
}
````

Instead of defining your heirarchy manaully, cairn can do it for you.

## Style Hierarchies - `cairn.pile`
Use `cairn.pile({})` and you can define style relationships using nesting objects.

````javascript
let React = require('react-native');
let cairn = require('cairn');
let { Text, View, StyleSheet } = React;

let pile = cairn.pile({
  text: {
    fontFamily: 'Cochin',
    color: '#222',

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
  }
});
let sheet = StyleSheet.create(pile);
let style = cairn.style(sheet);

class MyView extends React.Component {
  render() {
    return (
      <!-- text, header, header.h1, header.h1.user -->
      <Text {...style('text.header.h1.user')}>Primary Header Text</Text>
      <!-- text, header, header.h2 -->
      <Text {...style('text.header.h2')}>Secondary Header Text</Text>
      <!-- text -->
      <Text {...style('text')}>Body Text</Text>
    );
  }
}
````

If your stylesheet gets large enough, you may want to separate it out into multiple files:

````javascript
let React = require('react-native');
let cairn = require('cairn');
let { StyleSheet } = React;

// Do not pile any of these, just return objects
let headlines = require('./headlines');
let links = require('./links');
let paragraphs = require('./paragraphs');
let buttons = require('./buttons');
let panels = require('./panels');

let sheet = {
  text: {
    // Applies to all child types of text
    fontFamily: 'Helvetica',

    headlines,
    links,
    paragraphs
  },
  buttons,
  panels
};

module.exports = StyleSheet.create(cairn.pile(sheet));

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

### Case Study

Imagine you want to change the font family for all text in your entire application within React Native.  This means you need to give a style attribute to every `<Text>` tag, and if you have multiple kinds of text elements, you must repeat your `fontFamily: 'MyFont'` line in every type of text's class, or apply multiple multiple to every text element.  Redundancy in your styles or an unweildy array of styles on every text element in your views.  

Pick your evil.

Now, you want to change the font family for a type of text element, say headers.  You must update every class in your stylesheet (i.e. change every `fontFamily` line on header types) or add ANOTHER class in every component (i.e. change the name of class being used or add an additional class to every `text` element). 

With Cairn, you could instead define a top level `text` namespace, define the defaults there that apply to all text elements, have subtypes for your more specific types like `text.body` or `text.headers` which can have their own children.  Then, changing the font style later for all text or all headers is easy: just change one line in the stylesheet and all the children's styles will be updated because they extend from it.
