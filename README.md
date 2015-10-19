# Cairn
Cairn is a tiny library that provides a more familiar styling syntax for React Native. 

Cairn replaces the default `styles={[styles.foo, styles.bar]}` with a simpler, more familiar string-based syntax that supports applying multiple classes, heirarchical classes en masse (i.e. simple cascading), and easily toggling conditional classes.

Cairn is NOT a CSS transpiler.

##Basic Usage `styles('foo bar baz')`

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

###Conditional classes
####`styles('foo bar? baz?', true/false)`
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
let styles = cairn(styles);

class MyView extends React.Component {
  render() {
    let isActive = true;
    return (
      <Text styles={styles('p active?', isActive)}>Always a P, not always active</Text>
    );
  }
}
````

####`styles('bar? baz?newName', { bar: true, newName: false })`
Specify a hash and the value of the classname's property will be used as the toggle state of that class.  Rename the property by giving the name after the `?`.

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
let styles = cairn(styles);

class MyView extends React.Component {
  render() {
    let state = { isActive: true, blue: false };
    return (
      <Text styles={styles('p blue? active?isActive', state)}>Are you active and blue?</Text>
    );
  }
}
````

###Cascading styles: `styles('foo.bar.baz')`
For organization and reusability, it might be helpful to use a dot notation to denote class heirarchies in your stylesheet definitions (e.g. `pageContainer.withHeader`).  Defining your styles in this way in your stylesheet, then using the matching dot notation in the call to `style`, will result in the styles of all the parent types being applied en masse.  

This can make organization of your stylesheets dramatically cleaner, and the application of the style heirachy a breeze by simply having to define the element as being a `child` of `parent` and getting all the `parent`'s styles for free.

In the future, Cairn may be updated to generate these heirarchies for you to prevent the repetition in the class labels.  For now:

````javascript
let sheet = StyleSheet.create({
  'header': {
    fontFamily: 'Georgia',
    textDecorationLine: 'underline'
  },
  'header.h1': {
    fontSize: 30,
    color: 'blue'
  },
  'header.h1.user': {
    color: 'red'
  },
  'text': {
    fontFamily: 'Cochin',
    color: '#222'
  },
  'text.p': {
    marginBottom: 10
  }
});
let styles = cairn(sheet);
class MyView extends React.Component {
  render() {
    return (
      <Text styles={styles('header.h1.user')}>Header Text</Text>
      <Text styles={styles('text.p')}>Body Text</Text>
    );
  }
}
````

The above results in all the following classes being applied: `header`, `header.user`, `header.user.admin`.


#####What does it stand for?
**C**SS **A**lternative **I**n **R**eact **N**ative.  Maybe.
