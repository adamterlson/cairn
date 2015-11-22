# Cairn
Cairn is a tiny library for React Native that replaces the default `styles={[styles.foo, styles.bar]}` styling sytnax with a simpler string-based spread syntax: `{...style('foo bar')}`.  Cairn supports defining multiple classes, applying heirarchically-defined classes en masse, and conditional classes.

If you're not sure why you want this, check out the [Background](#background) section.

##Install
```
npm install --save cairn
```

###Basic Usage
####`let style = cairn.style(sheet[, options])`
Pass to `cairn.style` your React Native Stylesheet or object containing styles and use the returned function to apply the styles to elements.

**Available Options**

`spread` (default: true): Enable/disable spread syntax. If false, use `style={style('foo')}`.


####Apply multiple styles
#####`...style('foo bar baz')`
Apply multiple independent classes by passing a space-delimited string.  Classes are appended in order with last item having precedence.  Invalid class names will be ignored with a warning.

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
let style = cairn.style(sheet);

class MyView extends React.Component {
  render() {
    return (
      <Text {...style('h1')}>Main Heading</Text>
      <Text {...style('h2 italic')}>Secondary Heading</Text>
    );
  }
}
````

####Apply heirarchy of styles
#####`...style('foo.bar.baz')`
Set up your stylesheet with parent-child relationships annotated via dot notation.  Then, use cairn to expand a child reference (e.g. `header.h1.user`) to include parents as well (`header, header.h1, header.h1.user`).

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
let style = cairn.style(sheet);

class MyView extends React.Component {
  render() {
    return (
      <!-- header, header.h1, header.h1.user -->
      <Text {...style('header.h1.user')}>Primary Header Text</Text>
      <!-- header, header.h2 -->
      <Text {...style('header.h2')}>Secondary Header Text</Text>
      <!-- text, text.p -->
      <Text {...style('text.p')}>Body Text</Text>
    );
  }
}
````

####Conditional styles
#####`style('foo bar? baz?', true/false)`
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
let style = cairn(sheet);

class MyView extends React.Component {
  render() {
    let isActive = true;
    return (
      <Text {...style('p active?', isActive)}>Always a P, not always active</Text>
    );
  }
}
````

#####`style('bar? baz?newName', { bar: truthy, newName: falsey })`
Provide a hash as a second parameter and the value of the classname's corresponding property will be used as the toggle state of that class.  Specify a different property to use by specifying the property name after the `?`.

````javascript
let sheet = StyleSheet.create({
  'p': {
    fontSize: 30
  },
  'error': {
    color: 'blue'
  }
});
let style = cairn(sheet);

class MyView extends React.Component {
  render() {
    return (
      <Text {...style('p error?name', this.props)}>
        { this.props.name ? 'Thanks!' : 'Please enter your name.' }
      </Text>
    );
  }
}
````

####Inline styles
#####`style('foo', [{ color: 'red' }])`
It may be necessary (such as with animations) to apply inline styles. Include an array of additional style objects to apply as the last parameter to `style`.  


##`cairn.pile({})`
Construct your stylesheet with dot notation via nesting objects.

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
let style = cairn.style(sheet);

class MyView extends React.Component {
  render() {
    return (
      <!-- header, header.h1, header.h1.user -->
      <Text {...style('header.h1.user')}>Primary Header Text</Text>
      <!-- header, header.h2 -->
      <Text {...style('header.h2')}>Secondary Header Text</Text>
      <!-- text, text.p -->
      <Text {...style('text.p')}>Body Text</Text>
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

##Background

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

###Case Study
Imagine you want to change the font family for all text in your entire application within React Native.  This means you need to give a style attribute to every `<Text>` tag, and if you have multiple kinds of text elements, you must repeat your `fontFamily: 'MyFont'` line in every type of text's class, or apply multiple multiple to every text element.  Redundancy in your styles or an unweildy array of styles on every text element in your views.  

Pick your evil.

Now, you want to change the font family for a type of text element, say headers.  You must update every class in your stylesheet (i.e. change every `fontFamily` line on header types) or add ANOTHER class in every component (i.e. change the name of class being used or add an additional class to every `text` element). 

With Cairn, you could instead define a top level `text` namespace, define the defaults there that apply to all text elements, have subtypes for your more specific types like `text.body` or `text.headers` which can have their own children.  Then, changing the font style later for all text or all headers is easy: just change one line in the stylesheet and all the children's styles will be updated because they extend from it.
