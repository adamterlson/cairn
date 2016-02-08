
import { StyleSheet } from 'react-native';
import cairn from 'cairn';

const colors = {
    blue: 'blue',
    gray: 'gray',
    red: 'red'
};

export default cairn({
  text: {
    fontFamily: 'Cochin',
    color: colors.gray,

    header: {
      fontFamily: 'Georgia',
      textDecorationLine: 'underline'
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
