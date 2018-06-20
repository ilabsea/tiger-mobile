import React, { Component } from 'react';
import Tabs from './app/screens/tabs';
import { NetInfo } from 'react-native';
import { setCustomText} from 'react-native-global-props';

import realm from './app/schema';
import statisticService from './app/services/statistic.service';
import uploadService from './app/services/upload.service';

const customTextProps = {
  style: {
    fontFamily: 'KhSiemreap',
    color: '#111'
  }
};

setCustomText(customTextProps);

export default class App extends Component {
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
    return (<Tabs ref="app"></Tabs>)
  }
}
