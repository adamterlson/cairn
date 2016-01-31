import { StyleSheet } from 'react-native';
import cairn from 'cairn';

// Define your global, reusable styles, optionally passing in a transformer to create a stylesheet

export default cairn({
    container: {
        flex: 1
    },
    text: {
        header: {
            fontSize: 30
        },
        button: {
            textAlign: 'center'
        }
    },
    button: {
        props: {
            underlayColor: 'blue'
        },

        borderRadius: 10
    }
}, (styles) => StyleSheet.create(styles));
