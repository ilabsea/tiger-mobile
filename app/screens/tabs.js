import React, { Component } from 'react';
import { View } from 'react-native';
import { ThemeProvider, BottomNavigation } from 'react-native-material-ui';
import I18n from '../i18n/i18n';

import Home from './home';
import Library from './library';
import About from './about';
import Category from './category';

const uiTheme = {
  fontFamily: 'KhSiemreap',
  palette: {
    primaryColor: '#f55b1f',
  },
};

export default class Tabs extends Component {
  static navigationOptions = {
    header: null,
  };

  constructor(props) {
    super(props);
    this.state = { active: 'home' };
  }

  onSetActive(tab) {
    this.setState({active: tab});
  }

  onSetStory(story) {
    this.setState({story: story})
  }

  render() {
    return (
      <View style={{flex: 1}}>
        <View style={{flex: 1}}>
          { this.state.active == 'home' &&
            <Home
              onSetActive={(tab) => this.onSetActive(tab)}
              onSetStory={(story) => this.onSetStory(story)}
            ></Home>
          }

          { this.state.active == 'category' &&
            <Category
              onSetActive={(tab) => this.onSetActive(tab)}
              onSetStory={(story) => this.onSetStory(story)}
            ></Category>
          }
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
      </View>
    );
  }
}
