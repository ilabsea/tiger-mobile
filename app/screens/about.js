import React, {Component} from 'react';
import {
  Text,
  View,
  ScrollView,
  StyleSheet,
  Image,
  Linking,
  TouchableOpacity,
} from 'react-native';

import { Toolbar } from 'react-native-material-ui';
import I18n from '../i18n/i18n';
import headerStyle from '../assets/style_sheets/header';
import DeviceInfo from 'react-native-device-info';

export default class About extends Component {
  constructor(props) {
    super(props);
  }

  _openLink(url) {
    Linking.openURL(url);
  }

  _renderContent() {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{I18n.t('tiger_app')}</Text>
        <Text style={styles.paragraph}>{I18n.t('tiger_app_definition')}</Text>
        <Text style={styles.paragraph}>{I18n.t('tiger_app_creation')}</Text>

        <TouchableOpacity onPress={()=> this._openLink('http://www.kapekh.org/')}>
          <Image
            style={{width: 140, height: 140}}
            source={require('../assets/images/about/kape.png')}/>
        </TouchableOpacity>

        <Text style={styles.paragraph}>{I18n.t('tiger_app_collaboration')}</Text>

        <TouchableOpacity onPress={()=> this._openLink('http://ilabsoutheastasia.org/')}>
          <Image
            style={{width: 250, height: 61}}
            source={require('../assets/images/about/instedd.png')}/>
        </TouchableOpacity>
      </View>
    )
  }

  render() {
    return (
      <View style={{flex: 1, backgroundColor: '#fff3df'}}>
        <Toolbar
          centerElement={<Text style={headerStyle.title}>{I18n.t('about_app')}</Text>}
        />

        <ScrollView style={{flex: 1}}>
          { this._renderContent() }

          <View style={styles.footer}>
            <Text style={{textAlign: 'right'}}>ជំនាន់: {DeviceInfo.getVersion()}</Text>
          </View>
        </ScrollView>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    margin: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
  },
  paragraph: {
    textAlign: 'center',
    marginTop: 24,
  },
  footer: {
    marginTop: 20,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  }
});
