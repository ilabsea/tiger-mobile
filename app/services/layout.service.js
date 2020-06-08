import AsyncStorage from '@react-native-community/async-storage';

let LAYOUT_KEY = 'Layout';

export default class Layout {
  static layout;

  static get(callback) {
    if (!!this.layout) {
      return !!callback && callback(this.layout);;
    }

    AsyncStorage.getItem(LAYOUT_KEY, (err, view) => {
      this.layout = view || 'grid';

      !!callback && callback(this.layout);
    });
  }

  static set(view, callback) {
    AsyncStorage.setItem(LAYOUT_KEY, view, () => {
      this.layout = view;

      !!callback && callback();
    });
  }
}
