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
import { environment } from '../environments/environment';

export default class About extends Component {
  downloadUrl = `${environment.domain}/download_mobile_guide`;

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

        <View style={styles.imgWrapper}>
          <Image
            style={{maxHeight: 70}}
            resizeMode="contain"
            source={require('../assets/images/about/tiger_app.jpg')}/>
        </View>

        <Text style={styles.paragraph}>{I18n.t('tiger_app_creation')}</Text>

        <Text style={styles.paragraph}>{I18n.t('supported_by')}</Text>

        <View style={styles.imgWrapper}>
          <Image
            style={[styles.img]}
            resizeMode="contain"
            source={require('../assets/images/about/supported_by/eu.jpg')}/>
          <Image
            style={[styles.img, {marginHorizontal: 15, flex: 3}]}
            resizeMode="contain"
            source={require('../assets/images/about/supported_by/belgium.png')}/>
          <Image
            style={[styles.img, {flex: 2}]}
            resizeMode="contain"
            source={require('../assets/images/about/supported_by/flanders.jpg')}/>
        </View>

        <Text style={styles.paragraph}>{I18n.t('implemented_by')}</Text>

        <View style={styles.imgWrapper}>
          <Image
            style={[styles.img, {maxHeight: 60, flex: 2}]}
            resizeMode="contain"
            source={require('../assets/images/about/implemented_by/vvob.gif')}/>
          <Image
            style={[styles.img, {maxHeight: 60}]}
            resizeMode="contain"
            source={require('../assets/images/about/implemented_by/kape.png')}/>
          <Image
            style={[styles.img, {maxHeight: 60}]}
            resizeMode="contain"
            source={require('../assets/images/about/implemented_by/gadc.gif')}/>
          <Image
            style={[styles.img, {maxHeight: 60}]}
            resizeMode="contain"
            source={require('../assets/images/about/implemented_by/pko.jpg')}/>
        </View>

        <Text style={styles.paragraph}>{I18n.t('collaborated_by')}</Text>

        <View style={styles.imgWrapper}>
          <Image
            style={{maxWidth: 70, maxHeight: 70, marginRight: 15}}
            resizeMode="contain"
            source={require('../assets/images/about/collaborated_by/moey.jpg')}/>

          <Image
            style={{maxWidth: 70, maxHeight: 70}}
            resizeMode="contain"
            source={require('../assets/images/about/collaborated_by/women_affairs.jpg')}/>
        </View>

        <Text style={styles.paragraph}>{I18n.t('technical_by')}</Text>

        <View style={styles.imgWrapper}>
          <TouchableOpacity onPress={()=> this._openLink('http://ilabsoutheastasia.org/')}>
            <Image
              style={{width: 250, height: 61}}
              source={require('../assets/images/about/instedd.png')}/>
          </TouchableOpacity>
        </View>

        <View style={styles.imgWrapper}>
          <TouchableOpacity onPress={()=> this._openLink(this.downloadUrl)}>
            <Text style={{color: '#1976d2'}}>{I18n.t('download_how_to_use')}</Text>
          </TouchableOpacity>
        </View>
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
            <Text style={{textAlign: 'right'}}>{I18n.t('version')}: {DeviceInfo.getVersion()}</Text>
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
  },
  imgWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
  },
  img: {
    flex: 1,
    maxHeight: 50,
  }

});
