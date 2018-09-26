import React, {Component} from 'react';
import {
  Text,
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  AsyncStorage,
} from 'react-native';

import { Toolbar } from 'react-native-material-ui';
import I18n from '../i18n/i18n';
import headerStyle from '../assets/style_sheets/header';
import { USER_TYPE } from '../utils/variable';
import ModalDialog from 'react-native-modal';
import styles from '../assets/style_sheets/user_type';

export default class UserTypeModal extends Component {
  static navigationOptions = {
    header: null,
  };

  _selectUser(user) {
    AsyncStorage.setItem(USER_TYPE, user, () => {
      this.props.onRequestClose();
    });
  }

  _renderContent() {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.btn} onPress={() => this._selectUser('teacher')}>
          <Text style={styles.btnText}>{I18n.t('teacher')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btn} onPress={() => this._selectUser('parent')}>
          <Text style={styles.btnText}>{I18n.t('parent')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btn} onPress={() => this._selectUser('student')}>
          <Text style={styles.btnText}>{I18n.t('student')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btn} onPress={() => this._selectUser('other')}>
          <Text style={styles.btnText}>{I18n.t('other')}</Text>
        </TouchableOpacity>
      </View>
    )
  }

  render() {
    const { modalVisible, onRequestClose, ...props } = this.props;

    return (
      <ModalDialog
        {...props}
        visible={modalVisible}
        onRequestClose={onRequestClose}
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
