import React, {Component} from 'react';
import {
  Text,
  View
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { RadioButton } from 'react-native-material-ui';
import I18n from '../i18n/i18n';
import headerStyle from '../assets/style_sheets/header';
import { AUDIOICON } from '../utils/variable';
import styles from '../assets/style_sheets/user_type';
import ModalDialog from 'react-native-modal';

const radio_props = [
  {label: 'autoplay', value: 'volume-up'},
  {label: 'disable_autoplay', value: 'volume-off'}
];

export default class AudioModal extends Component {

  constructor(props) {
    super(props);

    this.state = { audioIcon: ''};
  }

  componentDidMount(){
    AsyncStorage.getItem(AUDIOICON, (err, icon) => {
      icon = icon == null ? 'volume-off': icon;
      this.setState({ audioIcon: icon });
    })
  }

  _onSelect = (audioIcon) => {
    AsyncStorage.setItem(AUDIOICON, audioIcon, () => {
      this.setState({ audioIcon: audioIcon });
      this.props.onRequestClose(audioIcon);
    });
  }

  _renderContent() {
    let buttons = radio_props.map((obj, i) => {
      return(
       <RadioButton
          key={i}
          label={I18n.t(obj.label)}
          checked={this.state.audioIcon == obj.value}
          value={obj.value}
          onSelect={this._onSelect}
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
        <View style={{ padding: 24, backgroundColor: '#fff' }}>
          <Text>{I18n.t('auto_play_setting')}</Text>

          { this._renderContent() }
        </View>
      </ModalDialog>
    )
  }
}
