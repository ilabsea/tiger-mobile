import React, {Component} from 'react';
import {
  Text,
  View,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { RadioButton, Icon } from 'react-native-material-ui';
import I18n from '../i18n/i18n';
import headerStyle from '../assets/style_sheets/header';
import { USER_TYPE } from '../utils/variable';
import ModalDialog from 'react-native-modal';
import styles from '../assets/style_sheets/user_type';
import Images from '../utils/images';

const radio_props = [
  {label: 'teacher', value: 'teacher', image: 'teacher'},
  {label: 'guardian', value: 'guardian', image: 'guardian'},
  {label: 'student', value: 'student', image: 'student'},
  {label: 'other', value: 'other', image: 'other'}
]

export default class UserTypeModal extends Component {
  state = { userType: '' };

  componentDidMount() {
    AsyncStorage.getItem(USER_TYPE).then((userType) => {
      this.setState({userType: userType});
    });
  }

  _onSelectUserType = (userType) => {
    this.setState({ userType: userType });

    AsyncStorage.setItem(USER_TYPE, userType, () => {
      this.props.onRequestClose();
    });
  }

  _renderContent() {
    let buttons = radio_props.map((obj, i) => {
      return(
        <View style={{flexDirection: 'row'}}>
          <RadioButton
              key={i}
              label={I18n.t(obj.label)}
              checked={this.state.userType == obj.value}
              value={obj.value}
              onSelect={this._onSelectUserType}
          />

          <View style={{position: 'absolute', left: 42, top: 10}}>
            <Image source={Images[obj.image]} style={{width: 24, height: 24}}  />
          </View>
        </View>
      )
    })

    return (
      <View style={styles.container}>
        { buttons }
      </View>
    )
  }

  render() {
    const { modalVisible, ...props } = this.props;

    return (
      <ModalDialog
        {...props}
        visible={modalVisible}
        animationType={'slide'}
      >

        <View style={{ padding: 24, backgroundColor: '#fff'}}>
          <Text>{I18n.t('choose_user_type')}</Text>

          { this._renderContent() }
        </View>
      </ModalDialog>
    )
  }
}
