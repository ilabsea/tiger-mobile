import React, {Component} from 'react';
import {
  Text,
  View,
  Button,
  ScrollView,
  StyleSheet,
  Linking,
  TouchableOpacity,
} from 'react-native';

import {
  Toolbar,
  Icon,
} from 'react-native-material-ui';

import I18n from '../i18n/i18n';

export default class Home extends Component {
  componentWillMount() {
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={{flex: 1, flexDirection: 'column'}}>
          <Toolbar
            centerElement={<Text>{I18n.t('home')}</Text>}
          />

          <ScrollView style={styles.scrollContainer}>
            <Text>My Home</Text>
          </ScrollView>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: 'pink'
  }
});
