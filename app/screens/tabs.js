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
import { MenuProvider } from 'react-native-popup-menu';
import I18n from '../i18n/i18n';
import Home from '../screens/home';
import Library from '../screens/library';
import About from '../screens/about';
import Category from '../screens/category';

const uiTheme = {
  palette: {
    primaryColor: COLOR.tealA700,
  },
  toolbar: {
    container: {
    }
  }
};

export default class Tabs extends Component {
  constructor(props) {
    super(props);
    this.state = { active: 'category' };
  }

  onSetActive(tab) {
    this.setState({active: tab});
  }

  onSetStory(story) {
    this.setState({story: story})
  }

  render() {
    return (
      <ThemeProvider uiTheme={uiTheme}>
        <MenuProvider style={{flex:1}}>
          <StatusBar backgroundColor="rgba(0, 0, 0, 0.2)" translucent />
          <View style={{ backgroundColor: COLOR.tealA700, height: 24 }} />

          <View style={{flex: 1}}>
            { this.state.active == 'home' &&
              <Home
                onSetActive={(tab) => this.onSetActive(tab)}
                onSetStory={(story) => this.onSetStory(story)}
              ></Home>
            }

            { this.state.active == 'category' && <Category></Category> }
            { this.state.active == 'library' &&
              <Library
                story={this.state.story}
                onSetStory={(story) => this.onSetStory(story)}
              ></Library>
            }
            { this.state.active == 'about' && <About></About> }
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
        </MenuProvider>
      </ThemeProvider>
    );
  }
}