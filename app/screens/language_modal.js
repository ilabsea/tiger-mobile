import React, {Component} from 'react';
import {
  Text,
  View
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { RadioButton } from 'react-native-material-ui';
import I18n from '../i18n/i18n';
import { LANGUAGE } from '../utils/variable';
import styles from '../assets/style_sheets/user_type';
import ModalDialog from 'react-native-modal';

const radio_props = [
  {label: I18n.t('km'), value: 'km'},
  {label: I18n.t('en'), value: 'en'}
];

export default class LanguageModal extends Component {

  constructor(props) {
    super(props);

    this.state = { language: I18n.currentLocale() };
  }

  _onSelectLanguage = (language) => {
    AsyncStorage.setItem(LANGUAGE, language, () => {
      I18n.locale = language;
      this.setState({ language: language });
      this.props.onRequestClose();
    });
  }

  _renderContent() {
    let buttons = radio_props.map((obj, i) => {
      return(
       <RadioButton
          key={i}
          label={obj.label}
          checked={this.state.language == obj.value}
          value={obj.value}
          onSelect={this._onSelectLanguage}
       />
      )
    })

    return (
      <View style={[styles.container, {minHeight: 100}]}>
        { buttons }
      </View>
    )
  }

  render() {
    const { modalVisible, ...props } = this.props;

    return (
      <ModalDialog
        {...props}
        visible={modalVisible}
        animationType={'slide'}
      >

        <View style={{ padding: 24, backgroundColor: '#fff'}}>
          <Text>{I18n.t('choose_language')}</Text>

          { this._renderContent() }
        </View>
      </ModalDialog>
    )
  }
}
