import React, {Component} from 'react';
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  AsyncStorage,
} from 'react-native';

import { Toolbar } from 'react-native-material-ui';
import I18n from '../i18n/i18n';
import headerStyle from '../assets/style_sheets/header';
import { USER_TYPE } from '../utils/variable';
import styles from '../assets/style_sheets/user_type';

export default class UserType extends Component {
  static navigationOptions = {
    header: null,
  };

  _selectUser(user) {
    AsyncStorage.setItem(USER_TYPE, user, () => {
      this.props.navigation.dispatch({type: 'Navigation/RESET', index: 0, actions: [{ type: 'Navigation/NAVIGATE', routeName:'Tabs'}]})
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
