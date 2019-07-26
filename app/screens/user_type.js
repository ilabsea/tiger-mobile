import React, {Component} from 'react';
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { RadioButton } from 'react-native-material-ui';
import { Toolbar } from 'react-native-material-ui';
import I18n from '../i18n/i18n';
import headerStyle from '../assets/style_sheets/header';
import { USER_TYPE } from '../utils/variable';
import styles from '../assets/style_sheets/user_type';

const radio_props = [
  {label: 'teacher', value: 'teacher'},
  {label: 'guardian', value: 'guardian'},
  {label: 'student', value: 'student'},
  {label: 'other', value: 'other'},
];

export default class UserType extends Component {
  static navigationOptions = {
    header: null,
  };

  state ={userType: ''}

  _onSelectUserType = (userType) => {
    this.setState({ userType: userType });

    AsyncStorage.setItem(USER_TYPE, userType, () => {
      this.props.navigation.dispatch({type: 'Navigation/RESET', index: 0, actions: [{ type: 'Navigation/NAVIGATE', routeName:'Tabs'}]})
    });
  }

  _renderContent() {
    let buttons = radio_props.map((obj, i) => {
      return(
       <RadioButton
          key={i}
          label={I18n.t(obj.label)}
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
    return (
      <View style={{flex: 1, backgroundColor: '#fff3df'}}>
        <Toolbar
          centerElement={<Text style={headerStyle.title}>{I18n.t('choose_user_type')}</Text>}
        />

        <ScrollView style={{flex: 1}}>
          <View style={{ padding: 20, paddingVertical: 16 }}>
            { this._renderContent() }
          </View>
        </ScrollView>
      </View>
    )
  }
}
