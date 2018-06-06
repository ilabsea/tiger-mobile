import React, {Component} from 'react';
import {Text} from 'react-native';

export default class myText extends Component {
  render() {
    const {children, style, ...props} = this.props;

    return (
      <Text
        style={[{fontFamily: 'KhmerOS'}, style]}
        { ...props }
      >
        { children }
      </Text>
    )
  }
}
