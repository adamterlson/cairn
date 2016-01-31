import React, { View, TouchableHighlight } from 'react-native';
import globalStyle from '../style';

// Grab the global styles, and extend them with styles that you will only use in the specific component

const style = globalStyle.extend({
    container: {
        backgroundColor: 'blue'
    },
    list: {
        flex: 1,
        flexDirection: 'column'
    },
    listItem: {
        flex: 1,

        withUser: {
            backgroundColor: 'red'
        }
    },
    modifier: {
        height: 10
    },
    fred: {
        textDecoration: 'underline'
    }
});

export default class MyComponentB {
    constructor(props) {
        super(props);

        this.setState({ activeUser: { name: 'fred' } })
    }

    render() {
        <View {...style('container')}>
            <View {...style('list')}>
                <View {...style('listItem')}>
                    <Text>Item 1</Text>
                </View>
                <View {...style('listItem modifier')}>
                    <Text>Item 2</Text>
                </View>
                <View {...style('listItem.withUser')}>
                    <Text {...style('fred?', activeUser.name === fred)}>{this.state.activeUser.name}</Text>
                </View>
            </View>
        </View>
    }
};
