/* to add more local
import en from './locales/en';

I18n.translations = {
  km,
  en,
  ...
};

*/

import I18n from 'react-native-i18n';
import km from './locales/km';
import en from './locales/en';

I18n.fallbacks = true;

I18n.translations = {
  km,
  en
};

I18n.locale = 'km';

export default I18n;
