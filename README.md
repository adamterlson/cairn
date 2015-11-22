# Cairn
Cairn is a tiny library for React Native that replaces the default `styles={[styles.foo, styles.bar]}` styling sytnax with a simpler string-based syntax: `styles={styles('foo bar')}`.  Cairn supports defining multiple classes, applying heirarchically-defined classes en masse (i.e. simple cascading), and conditional classes.

##Install
```
npm install --save cairn
```

###Background

In React Native, there is no cascading of styles, so when you have multiple types of something, say a pageContainer, you may initially be tempted to style each individually:

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
<View styles={styles.pageContainerWithHeaderAndFooter}>Body Text</View>
````

This can be improved upon by extracting out the common bits into their own classes and styling your element via an array:

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
<View styles={[
  styles.pageContainer, 
  styles.pageContainerWithHeader, 
  styles.pageContainerWithFooter ]}>
  Body Text
</View>
````

This is better, there's less redundancy in the styles, but the length of the class array can very quickly get out of hand when each bit of style is separated.  Additionally, there is a redundancy of "pageContainer" in the stylesheet.  What we need is a way to get the best of both worlds:

1) Be able to separate our stylesheet out into a set of parent types and child types that extend their parents, and

2) Reference this child type directly and get all the parent styling for free without having to compose it manually

###Basic Usage
####Sheet Creation: `styles = cairn.style(sheet[, options])`
Pass to `cairn.style` your React Native Stylesheet object and use the returned function to apply the styles to elements.

**Available Options**
`spread` (default: true): Disable spread syntax (`style={styles('foo')}` instead of `...styles('foo')`).

####`styles('foo bar baz')`
Apply multiple classes by passing a space-delimited string.  Classes are appended in order with last item having precedence.  Invalid class names will be ignored with a warning.

```javascript
let React = require('react-native');
let cairn = require('cairn');
let { Text, StyleSheet } = React;
let sheet = StyleSheet.create({
  'h1': {
    fontSize: 30
  },
  'h2': {
    fontSize: 20
  },
  'italic': {
    fontStyle: 'italic'
  }
});
let styles = cairn.style(sheet);

class MyView extends React.Component {
  render() {
    return (
      <Text ...styles('h1')>Main Heading</Text>
      <Text ...styles('h2 italic')>Secondary Heading</Text>
    );
  }
}
````

###`styles('foo.bar.baz')`
Set up your stylesheet with parent-child relationships annotated via dot notation.  Then, use `cairn.styles` to expand a reference made directly to a child (e.g. `header.h1.user`) to contain references to every parent as well (`header, header.h1, header.h1.user`).

````javascript
let sheet = StyleSheet.create({
  'header': {
    fontFamily: 'Georgia',
    textDecorationLine: 'underline'
  },
  'header.h1': {
    fontSize: 30
  },
  'header.h1.user': {
    color: 'red'
  },
  'header.h2': {
    fontSize: 20
  },
  'text': {
    fontFamily: 'Cochin',
    color: '#222'
  },
  'text.p': {
    marginBottom: 10
  }
});
let styles = cairn.style(sheet);

class MyView extends React.Component {
  render() {
    return (
      <!-- header, header.h1, header.h1.user -->
      <Text styles={styles('header.h1.user')}>Primary Header Text</Text>
      <!-- header, header.h2 -->
      <Text styles={styles('header.h2')}>Secondary Header Text</Text>
      <!-- text, text.p -->
      <Text styles={styles('text.p')}>Body Text</Text>
    );
  }
}
````

##`cairn.pile([name ,] {})`
An alternative to the above, manual method of constructing your stylesheet with dot notation is available, by nesting the objects instead and calling `pile`.

Provide an optional name to the pile and all classes will be prefixed with that name.

````javascript
let React = require('react-native');
let cairn = require('cairn');
let { Text, View, StyleSheet } = React;

let pile = cairn.pile({
  header: {
    fontFamily: 'Georgia',
    textDecorationLine: 'underline',

    h1: {
      fontSize: 30,

      user: {
        color: 'red'
      }
    },

    h2: {
      fontSize: 20
    }
  }
  text: {
    fontFamily: 'Cochin',
    color: '#222',

    p: {
      marginBottom: 10
    }
  }
});
let sheet = StyleSheet.create(pile);
let styles = cairn.style(sheet);

class MyView extends React.Component {
  render() {
    return (
      <!-- header, header.h1, header.h1.user -->
      <Text styles={styles('header.h1.user')}>Primary Header Text</Text>
      <!-- header, header.h2 -->
      <Text styles={styles('header.h2')}>Secondary Header Text</Text>
      <!-- text, text.p -->
      <Text styles={styles('text.p')}>Body Text</Text>
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

####Conditional classes
#####`styles('foo bar? baz?', true/false)`
Append on conditional classes with the `?` flag and pass the toggle state as a the second parameter.  Styles lacking the conditional flag are always applied.

````javascript
let sheet = StyleSheet.create({
  'p': {
    fontSize: 30
  },
  'active': {
    fontSize: 20
  }
});
let styles = cairn(sheet);

class MyView extends React.Component {
  render() {
    let isActive = true;
    return (
      <Text styles={styles('p active?', isActive)}>Always a P, not always active</Text>
    );
  }
}
````

#####`styles('bar? baz?newName', { bar: true, newName: false })`
Provide a hash as a second parameter and the value of the classname's corresponding property will be used as the toggle state of that class.  Specify a different property to use by specifying the property name after the `?`.

````javascript
let sheet = StyleSheet.create({
  'p': {
    fontSize: 30
  },
  'active': {
    fontSize: 20
  },
  'blue': {
    color: 'blue'
  }
});
let styles = cairn(sheet);

class MyView extends React.Component {
  render() {
    let state = { isActive: true, blue: false };
    return (
      <Text styles={styles('p blue? active?isActive', state)}>Are you active and blue?</Text>
    );
  }
}
````


####What does it stand for?
**C**SS **A**lternative **I**n **R**eact **N**ative.  Maybe.
