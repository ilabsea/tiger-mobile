import React, {Component} from 'react';
import {Button} from 'react-native-material-ui';

export default class myButton extends Component {
  render() {
    const { title, onPress, ...props} = this.props;

    return (
      <Button
        {...props}
        raised
        accent
        style={{container: {marginTop: 6}}}
        onPress={onPress}
        text={title} />
    )
  }
}
