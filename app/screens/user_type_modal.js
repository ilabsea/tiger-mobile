import React, {Component} from 'react';
import {
  Text,
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  AsyncStorage,
} from 'react-native';

import RadioForm from 'react-native-simple-radio-button';
import { Toolbar } from 'react-native-material-ui';

import I18n from '../i18n/i18n';
import headerStyle from '../assets/style_sheets/header';
import { USER_TYPE } from '../utils/variable';
import ModalDialog from 'react-native-modal';
import styles from '../assets/style_sheets/user_type';

const radio_props = [
  {label: I18n.t('teacher'), value: 'teacher'},
  {label: I18n.t('parent'), value: 'parent'},
  {label: I18n.t('student'), value: 'student'},
  {label: I18n.t('other'), value: 'other'},
];

export default class UserTypeModal extends Component {
  static navigationOptions = {
    header: null,
  };

  userType = '';

  _onDone = () => {
    AsyncStorage.setItem(USER_TYPE, this.userType, () => {
      this.props.onRequestClose();
    });
  }

  _renderContent() {
    let index = radio_props.findIndex(b=> b.value == this.props.userType);

    return (
      <View style={styles.container}>
        <RadioForm
          radio_props={radio_props}
          initial={index}
          onPress={(value) => this.userType = value}
          labelStyle={{fontSize: 16, lineHeight: 30}}
          radioStyle={{marginBottom: 10}}
        />

        <View style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
          <TouchableOpacity onPress={() => this._onDone()} style={styles.btnDone}>
            <Text style={{color: '#fff'}}>{I18n.t('done')}</Text>
          </TouchableOpacity>
        </View>
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

        <View style={{ padding: 20, backgroundColor: '#fff'}}>
          <Text>{I18n.t('choose_user_type')}</Text>

          { this._renderContent() }
        </View>
      </ModalDialog>
    )
  }
}
