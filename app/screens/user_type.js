import React, {Component} from 'react';
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  AsyncStorage,
} from 'react-native';

import RadioForm from 'react-native-simple-radio-button';
import { Toolbar } from 'react-native-material-ui';
import I18n from '../i18n/i18n';
import headerStyle from '../assets/style_sheets/header';
import { USER_TYPE } from '../utils/variable';
import styles from '../assets/style_sheets/user_type';

const radio_props = [
  {label: I18n.t('teacher'), value: 'teacher'},
  {label: I18n.t('parent'), value: 'parent'},
  {label: I18n.t('student'), value: 'student'},
  {label: I18n.t('other'), value: 'other'},
];

export default class UserType extends Component {
  static navigationOptions = {
    header: null,
  };

  userType = '';

  _onDone = () => {
    AsyncStorage.setItem(USER_TYPE, this.userType, () => {
      this.props.navigation.dispatch({type: 'Navigation/RESET', index: 0, actions: [{ type: 'Navigation/NAVIGATE', routeName:'Tabs'}]})
    });
  }

  _renderContent() {
    return (
      <View style={styles.container}>
        <RadioForm
          radio_props={radio_props}
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
    return (
      <View style={{flex: 1}}>
        <Toolbar
          centerElement={<Text style={headerStyle.title}>{I18n.t('choose_user_type')}</Text>}
        />

        <ScrollView style={{flex: 1}}>
          { this._renderContent() }
        </ScrollView>
      </View>
    )
  }
}
