import React, {Component} from 'react';
import {
  Text,
  View,
  Button,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
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

  componentDidMount() {

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

  onScroll = (e) => {
    var windowHeight = Dimensions.get('window').height,
              height = e.nativeEvent.contentSize.height,
              offset = e.nativeEvent.contentOffset.y;
    if( windowHeight + offset >= height ){
        alert('End Scroll')
    }
  }

  render() {
    return (
      <View style={styles.flex}>
        <Toolbar
          centerElement={<Text style={headerStyle.title}>{I18n.t('home')}</Text>}
        />

        <ScrollView style={styles.container} onScroll={this.onScroll}>
          <View style={[styles.scrollContainer]}>
            <GridLayout
              items={this.state.items}
              itemsPerRow={2}
              renderItem={this.renderGridItem}
            />
          </View>
        </ScrollView>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
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
