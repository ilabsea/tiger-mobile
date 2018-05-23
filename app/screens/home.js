import React, {Component} from 'react';
import {
  Text,
  View,
  Button,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

import {
  Toolbar,
  Icon,
  COLOR,
} from 'react-native-material-ui';
import I18n from '../i18n/i18n';
import headerStyle from '../assets/style_sheets/header';
import GridLayout from 'react-native-layout-grid';

export default class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      items: [1,2,3,4,5,6,7,8,9,10],
    };
  }

  componentWillMount() {

  }

  // Grid Layout
  // https://github.com/toystars/react-native-layout-grid
  renderGridItem = (item) => (
    <View style={styles.item}>
      <View style={styles.flex} >
        <Text>{item}</Text>
      </View>
    </View>
  );

  render() {
    return (
      <View style={styles.container}>
        <View style={{flex: 1, flexDirection: 'column'}}>
          <Toolbar
            centerElement={<Text style={headerStyle.title}>{I18n.t('home')}</Text>}
            searchable={{
              autoFocus: true,
              placeholder: I18n.t('search_story'),
            }}
          />

          <ScrollView style={styles.scrollWrapper}>
            <View style={[styles.scrollContainer]}>
              <GridLayout
                items={this.state.items}
                itemsPerRow={2}
                renderItem={this.renderGridItem}
              />
            </View>
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
  scrollWrapper: {
    backgroundColor: COLOR.cyan900,
  },
  scrollContainer: {
    flex: 1,
    margin: 4,
  },
  flex: {
    flex: 1,
  },
  item: {
    height: 315,
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
  }
});
