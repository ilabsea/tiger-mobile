import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View
} from 'react-native';

import {
  ThemeProvider,
  BottomNavigation
} from 'react-native-material-ui';

import Home from './app/screens/home';

type Props = {};

export default class App extends Component<Props> {
  constructor(props) {
    super(props);
    this.state = { active: 'home' };
  }

  render() {
    return (
      <ThemeProvider uiTheme={{}}>
        <View style={{flex:1}}>
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
                  label="Home"
                  onPress={() => this.setState({ active: 'home' })}
              />
              <BottomNavigation.Action
                  key="category"
                  icon="apps"
                  label="Category"
                  onPress={() => this.setState({ active: 'category' })}
              />
              <BottomNavigation.Action
                  key="library"
                  icon="library-books"
                  label="Libray"
                  onPress={() => this.setState({ active: 'library' })}
              />
              <BottomNavigation.Action
                  key="about"
                  icon="settings"
                  label="About"
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
