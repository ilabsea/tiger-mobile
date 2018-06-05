import React, {Component} from 'react';
import {
  Text,
  View,
  ScrollView,
  StyleSheet,
} from 'react-native';

import { Toolbar } from 'react-native-material-ui';
import I18n from '../i18n/i18n';
import headerStyle from '../assets/style_sheets/header';

export default class About extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <View style={{flex: 1}}>
        <Toolbar
          centerElement={<Text style={headerStyle.title}>{I18n.t('about_app')}</Text>}
        />

        <ScrollView style={{flex: 1}}>
          <Text>About us</Text>
        </ScrollView>
      </View>
    )
  }
}

const styles = StyleSheet.create({

});
