import React from 'react';
import { StackNavigator } from 'react-navigation';
import { ThemeContext, getTheme } from 'react-native-material-ui';
import { MenuProvider } from 'react-native-popup-menu';
import { StatusBar } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
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

export default class AppNavigator extends React.Component {
  state = {};

  constructor(props) {
    super(props);
    this.state = {
      loaded: false,
      userSelected: false
    }
  }

  componentDidMount() {
    AsyncStorage.getItem(USER_TYPE).then((userType) => {
      this.setState({loaded: true, userSelected: !!userType})
    });
    // setTimeout(function() {
    //   SplashScreen.hide();
    // }, 3000);
  }

  render() {
    if (!this.state.loaded) {
      return (null)
    }

    return (
      <ThemeContext.Provider value={getTheme(uiTheme)}>
        <MenuProvider style={{flex:1}}>
          <StatusBar backgroundColor={'#e2561f'} />

          { this.state.userSelected && <Tabs></Tabs> }
          { !this.state.userSelected && <Navigator ref="app"></Navigator> }
        </MenuProvider>
      </ThemeContext.Provider>
    );
  }
}
