import React, { Component } from 'react';
import { StackNavigator } from 'react-navigation';
import { ThemeProvider } from 'react-native-material-ui';
import { MenuProvider } from 'react-native-popup-menu';
import { StatusBar, AsyncStorage } from 'react-native';
import SplashScreen from 'react-native-splash-screen';

// screens
import Tabs from './tabs';
import UserType from './user_type';

// variable
import { USER_TYPE } from '../utils/variable';

const Navigator = StackNavigator({
  UserType: { screen: UserType },
  Tabs: { screen: Tabs },
});

const uiTheme = {
  fontFamily: 'KhSiemreap',
  palette: {
    primaryColor: '#f55b1f',
  },
};

export default class AppNavigator extends Component {
  state = {};

  constructor(props) {
    super(props);

    AsyncStorage.getItem(USER_TYPE).then((userType) => {
      this.setState({loaded: true, userSelected: !!userType})
    });
  }

  componentDidMount() {
    setTimeout(function() {
      SplashScreen.hide();
    }, 3000);
  }

  render() {
    if (!this.state.loaded) {
      return (null)
    }

    return (
      <ThemeProvider uiTheme={uiTheme}>
        <MenuProvider style={{flex:1}}>
          <StatusBar backgroundColor={'#e2561f'} />

          { this.state.userSelected && <Tabs></Tabs> }
          { !this.state.userSelected && <Navigator ref="app"></Navigator> }
        </MenuProvider>
      </ThemeProvider>
    );
  }
}
