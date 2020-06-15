import { create } from 'apisauce';
import { environment } from '../environments/environment';

import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-community/async-storage';

const api = create({
  baseURL: environment.apiUrl
});

const notificationService = {
  create(body) {
    return api.put(`/registered_tokens`, body);
  }
};

const TOKEN_KEY = 'registeredToken';

export default (function() {
  handleSyncingToken = () => {
    messaging()
      .getToken()
      .then(token => {
        return this.saveTokenToDatabase(token);
      });

    // // Listen to whether the token changes
    // return messaging().onTokenRefresh(token => {
    //   this.saveTokenToDatabase(token);
    // });
  }

  saveTokenToDatabase = (token) => {
    AsyncStorage.getItem(TOKEN_KEY, (error, storageToken) => {
      if(!storageToken) {
        return this.saveToken(token);
      }

      let jsonValue = JSON.parse(storageToken);
      if(jsonValue.token == token) { return }

      this.saveToken(token, jsonValue.id);
    })
  }

  saveToken = async(token, id) => {
    let self = this;
    let data = {registered_token: {token: token, id: id}};
    notificationService.create(data)
      .then(res => {
        if(res.ok == true) {
          self.storeData(res.data);
        }
      });
  }

  storeData = async (value) => {
    try {
      const jsonValue = JSON.stringify(value)
      await AsyncStorage.setItem(TOKEN_KEY, jsonValue);
    } catch (e) {
    }
  }

  return {
    handleSyncingToken: handleSyncingToken
  }
})();
