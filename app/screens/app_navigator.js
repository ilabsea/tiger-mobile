import React, { Component } from 'react';
import { StackNavigator } from 'react-navigation';
import { ThemeProvider } from 'react-native-material-ui';
import { MenuProvider } from 'react-native-popup-menu';
import { StatusBar } from 'react-native';
import SplashScreen from 'react-native-splash-screen';

import Tabs from './tabs';
import UserType from './user_type';

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
  componentDidMount() {
    setTimeout(function() {
      SplashScreen.hide();
    }, 3000);
  }

  render() {
    return (
      <ThemeProvider uiTheme={uiTheme}>
        <MenuProvider style={{flex:1}}>
          <StatusBar backgroundColor={'#e2561f'} />

          <Navigator ref="app"></Navigator>
        </MenuProvider>
      </ThemeProvider>
    );
  }
}
