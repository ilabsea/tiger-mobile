import React, {Component} from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  FlatList,
  ActivityIndicator,
  Image,
  NetInfo,
  Modal,
} from 'react-native';

import RNFS from 'react-native-fs';
import { Toolbar, COLOR, Button } from 'react-native-material-ui';
import AwesomeIcon from 'react-native-vector-icons/FontAwesome';
import realm from '../schema';
import I18n from '../i18n/i18n';
import headerStyle from '../assets/style_sheets/header';
import storyStyle from '../assets/style_sheets/story';
import storyService from '../services/story.service';
import layoutSerive from '../services/layout.service';
import { environment } from '../environments/environment';

export default class CategoryModal extends Component {
  _data = [];

  constructor(props) {
    super(props);
  }

  componentDidMount() {

  }

  _closeModal() {
    this.props.onRequestClose();
  }

  _renderModelContent = (category) => {
    return (
      <View style={{flex: 1}}>
        <Toolbar
          leftElement="arrow-back"
          centerElement={<Text style={headerStyle.title}>{!!category && category.title}</Text>}
          onLeftElementPress={() => this.props.onRequestClose()}
        />
      </View>
    )
  }

  render() {
    const { category, modalVisible, onRequestClose, ...props } = this.props;

    return (
      <Modal
        {...props}
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => this._closeModal()}>

        { this._renderModelContent(category) }
      </Modal>
    )
  }
}
