import React, { View, TouchableHighlight } from 'react-native';
import globalStyle from '../style';

// Grab the global styles, and extend them with styles that you will only use in the specific component

const style = globalStyle.extend({
    container: {
        backgroundColor: 'red'
    }
});

export default () => (
    <View {...style('container')}>
        <TouchableHighlight {...style('button.danger')}>
            <Text {...style('text.button')}>Fire the missiles!</Text>
        </TouchableHighlight>
    </View>
);
