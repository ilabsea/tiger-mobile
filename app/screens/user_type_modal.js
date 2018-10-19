import React, {Component} from 'react';
import {
  Text,
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  AsyncStorage,
} from 'react-native';

import { RadioButton } from 'react-native-material-ui';
import { Toolbar } from 'react-native-material-ui';

import I18n from '../i18n/i18n';
import headerStyle from '../assets/style_sheets/header';
import { USER_TYPE } from '../utils/variable';
import ModalDialog from 'react-native-modal';
import styles from '../assets/style_sheets/user_type';

const radio_props = [
  {label: I18n.t('teacher'), value: 'teacher'},
  {label: I18n.t('guardian'), value: 'guardian'},
  {label: I18n.t('student'), value: 'student'},
  {label: I18n.t('other'), value: 'other'},
];

export default class UserTypeModal extends Component {
  static navigationOptions = {
    header: null,
  };

  state = {userType: ''};

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
       <RadioButton
          key={i}
          label={obj.label}
          checked={this.state.userType == obj.value}
          value={obj.value}
          onSelect={this._onSelectUserType}
       />
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
