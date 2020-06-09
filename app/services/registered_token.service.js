import { create } from 'apisauce';
import { environment } from '../environments/environment';

import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-community/async-storage';

const api = create({
  baseURL: environment.apiUrl
});

const notificationService = {
  create(body) {
    return api.post(`/registered_tokens`, body);
  }
};

const TOKEN_KEY = 'registered_token';

export default (function() {
  handleSyncingToken = () => {
    try {
      this.onTokenRefresh();

      let token = this.getStorage();
      if(!token) {
        this.saveTokenToDatabase();
      }
    } catch(e) {
      this.saveTokenToDatabase();
    }
  }

  saveTokenToDatabase = () => {
    messaging()
      .getToken()
      .then(token => {
        this.saveToken(token);
      });
  }

  saveToken = async(token) => {
    let self = this;
    notificationService.create({registered_token: {token: token}})
      .then(res => {
        if(res.ok == true) {
          self.setStorage(token);
        }
      });
  }

  setStorage = async(token) => {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  }

  getStorage = async() => {
    await AsyncStorage.getItem(TOKEN_KEY);
  }

  onTokenRefresh = () => {
    messaging().onTokenRefresh(token => {
      let storageToken = this.getStorage();
      if (storageToken == token) { return; }

      this.saveToken(token);
    });
  }

  return {
    handleSyncingToken: handleSyncingToken
  }

})();
