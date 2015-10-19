# cairn
A tiny library that converts React Native styling to space-delimited, string-based "selectors".  Cairn provides a more familiar styling experience, without going entirely to CSS, and also provides a super easy syntax for creating heirarchical styling and for toggling conditional classes.

##Basic Usage

```javascript
let React = require('react-native');
let cairn = require('cairn');
let { View, StyleSheet } = React;
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
let styles = cairn(sheet);

class MyView extends React.Component {
  render() {
    return (
      <Text styles={styles('h1')}>Main Heading</Text>
      <Text styles={styles('h2 italic')}>Secondary Heading</Text>
    );
  }
}
````

##Only Slightly Less Basic Usage

###Dot notation: `styles('foo.bar.baz')`
For organization, it might be helpful to use a dot notation to denote parent-child relationships in your stylesheet definitions.  Using this syntax, in conjunction with dot notation in the call to `style` will result in the styles of all the parent types being applied as well.  This can make organization and application of a heirarchy of styles dramatically simpler.

````javascript
let sheet = StyleSheet.create({
  'header': {
    textDecorationLine: 'underline',
    fontSize: 30
  },
  'header.user': {
    fontSize: 20,
    color: 'blue'
  },
  'header.user.admin': {
    color: 'red'
  }
});
let styles = cairn(sheet);
class MyView extends React.Component {
  render() {
    return (
      <Text styles={styles('header.user.admin')}>Header Text</Text>
    );
  }
}
````

The former results in all the following classes being applied: `header`, `header.user`, `header.user.admin`.


###Optional selector syntax: `styles('foo bar? baz', truthy/falsy)`
Append on conditional classes with the a `?` flag and pass the toggle state as a secondary parameter.  Styles lacking the conditional flag are always active.

````javascript
let sheet = StyleSheet.create({
  'p': {
    fontSize: 30
  },
  'active': {
    fontSize: 20
  }
});
let styles = cairn(styles);

class MyView extends React.Component {
  render() {
    let isActive = true;
    return (
      <Text styles={styles('p active?', isActive)}>Are you active?</Text>
    );
  }
}
````
