import React, { View, Text, TouchableHighlight, Image } from 'react-native';
import globalStyle from '../style.js';

const style = globalStyle.extend({
  container: {
    flex: 1
  },
  text: {
    fontSize: 20,

    header: {
      fontSize: 50
    },
    button: {
      textAlign: 'center'
    }
  }
});

class MyComponent extends React.Component {
  render() {
    return (
      <!-- component.container -->
      <View {...style('container')}>
        <!-- global.logo -->
        <Image {...style('logo')} />

        <!-- global.text, global.text.header, component.text, component.header -->
        <Text {...style('text.header')}>Header Text</Text>

        <!-- global.text, component.text -->
        <Text {...style('text')}>Module-specific Text</Text>

        <!-- global.button, global.button.user -->
        <TouchableHighlight {...style('button.user')} onPress={() => {}}>
          <!-- global.text, component.text, component.text.button -->
          <Text {...style('text.button')}>Button Text</Text>
        </TouchableHighlight>
      </View>
    );
  }
}
