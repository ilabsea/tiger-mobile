import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  StatusBar
} from 'react-native';

import {
  ThemeProvider,
  COLOR,
  BottomNavigation,
} from 'react-native-material-ui';

import I18n from './app/i18n/i18n';
import Home from './app/screens/home';

type Props = {};

const uiTheme = {
  palette: {
    primaryColor: COLOR.tealA700,
  },
  toolbar: {
    container: {
    }
  }
};

export default class App extends Component<Props> {
  constructor(props) {
    super(props);
    this.state = { active: 'home' };
  }

  render() {
    return (
      <ThemeProvider uiTheme={uiTheme}>
        <View style={{flex:1}}>
          <StatusBar backgroundColor="rgba(0, 0, 0, 0.2)" translucent />
          <View style={{ backgroundColor: COLOR.tealA700, height: 24 }} />

          <View style={styles.container}>
            { this.state.active == 'home' && <Home></Home> }
            { this.state.active == 'category' && <Text>Category</Text> }
            { this.state.active == 'library' && <Text>Library</Text> }
            { this.state.active == 'about' && <Text>About</Text> }
          </View>

          <BottomNavigation active={this.state.active} hidden={false} >
            <BottomNavigation.Action
                key="home"
                icon="home"
                label={I18n.t('home')}
                onPress={() => this.setState({ active: 'home' })}
            />
            <BottomNavigation.Action
                key="category"
                icon="apps"
                label={I18n.t('category')}
                onPress={() => this.setState({ active: 'category' })}
            />
            <BottomNavigation.Action
                key="library"
                icon="library-books"
                label={I18n.t('my_library')}
                onPress={() => this.setState({ active: 'library' })}
            />
            <BottomNavigation.Action
                key="about"
                icon="settings"
                label={I18n.t('about_app')}
                onPress={() => this.setState({ active: 'about' })}
            />
          </BottomNavigation>
        </View>
      </ThemeProvider>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  }
});
