import React, {Fragment} from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';

export default class myButton extends Fragment {
  render() {
    const { style, textStyle, title, onPress, ...props} = this.props;

    return (
      <TouchableOpacity
        {...props}
        onPress={onPress}
        style={[styles.btn, style]}>

        <Text style={[styles.btnText, textStyle]}> {title}</Text>
      </TouchableOpacity>
    )
  }
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: '#F14435',
    marginTop: 6,
    borderRadius: 10,
    paddingVertical: 8,
    justifyContent: 'center',
  },
  btnText: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'KhSiemreap',
    textAlign: 'center',
  }
});
