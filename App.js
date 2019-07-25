import React, { Fragment } from 'react';
import { NetInfo } from 'react-native';
import { setCustomText} from 'react-native-global-props';

import uploadService from './app/services/upload.service';
import AppNavigator from './app/screens/app_navigator';

const customTextProps = {
  style: {
    fontFamily: 'KhSiemreap',
    color: 'rgba(0,0,0,.87)'
  }
};

setCustomText(customTextProps);

export default class App {
  componentDidMount() {
    this._handleInternetConnection();
  }

  _handleInternetConnection() {
    NetInfo.isConnected.fetch().then(isConnected => {
      if (isConnected) {
        uploadService.upload();
      }
    });

    NetInfo.isConnected.addEventListener(
      'connectionChange',
      this._handleFirstConnectivityChange
    );
  }

  _handleFirstConnectivityChange = (isConnected) => {
    if (this.refs.app && isConnected) {
      uploadService.upload();
    }
  }

  render() {
    return (<AppNavigator ref="app"></AppNavigator>);
  }
}
