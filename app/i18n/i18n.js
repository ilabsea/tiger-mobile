/* to add more local
import en from './locales/en';

I18n.translations = {
  km,
  en,
  ...
};

*/

import { AsyncStorage } from 'react-native';
import I18n from 'react-native-i18n';
import km from './locales/km';
import en from './locales/en';
import { LANGUAGE } from '../utils/variable';

I18n.fallbacks = true;

I18n.translations = {
  km,
  en
};

AsyncStorage.getItem(LANGUAGE).then((language) => {
  I18n.locale = language || 'km';
});

export default I18n;
