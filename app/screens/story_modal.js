import React, {Component} from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  ScrollView,
} from 'react-native';

import { Toolbar, Icon } from 'react-native-material-ui';
import I18n from '../i18n/i18n';
import headerStyle from '../assets/style_sheets/header';

export default class StoryModal extends Component {
  _getFullDate(createdAt) {
    let days = ['អាទិត្យ', 'ច័ន្ទ', 'អង្គារ', 'ពុធ', 'ព្រហស្បតិ៍', 'សុក្រ', 'សៅរ៍'];
    let months = ['មករា', 'កុម្ភៈ', 'មិនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្តដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'];
    let time = new Date(createdAt);
    return "ថ្ងៃ" + days[time.getDay()] + ' ទី' + time.getDate() + ' ខែ' + months[time.getMonth()] + ' ឆ្នាំ' + time.getFullYear();
  }

  _renderBtnDownload(story) {
    return (
      <TouchableOpacity
        onPress={()=> {}}
        style={styles.btnDownload}
      >
        <Icon name="cloud-download" color='#fff' size={24} />
        <Text style={{color: '#fff', marginLeft: 10}}>{I18n.t('add_to_library')}</Text>
      </TouchableOpacity>
    )
  }

  _renderShortInfo(story) {
    let tags = story.tags.map((tag, index) => {
      return (
        <Text key={index} style={{marginRight: 5, backgroundColor: '#eee', borderRadius: 3, paddingHorizontal: 4}}>{tag.title}</Text>
      )
    })

    return (
      <View style={{flex: 1}}>
        <Text>{I18n.t('published_at')} { this._getFullDate(story.published_at)}</Text>
        <Text style={{fontFamily: 'KhmerOureang'}}>{I18n.t('story_title')} {story.title}</Text>
        <Text>{I18n.t('author')}: {!!story.user && story.user.email.split('@')[0]}</Text>
        <Text style={styles.tagsWrapper}> { tags } </Text>

        { this._renderBtnDownload() }
      </View>
    )
  }

  _renderDescription(story) {
    return (
      <View style={{padding: 24}}>
        <Text style={styles.descriptionTitle}>{I18n.t('introduction')}</Text>

        <Text style={{marginTop: 24}}>
          {story.description}
        </Text>
      </View>
    )
  }

  _renderImage(story) {
    return (
      <View style={styles.imageWrapper}>
        <Image
          style={styles.image}
          source={{uri: "http://192.168.1.107:3000" + story.image}}
        />
      </View>
    )
  }

  _renderModelContent = (story) => {
    return (
      <View>
        <Toolbar
          leftElement="arrow-back"
          centerElement={<Text style={headerStyle.title}>{story.title}</Text>}
          onLeftElementPress={this.props.onRequestClose}
        />

        <ScrollView>
          <View style={styles.shortInfo}>
            { this._renderImage(story) }
            { this._renderShortInfo(story) }
          </View>

          { this._renderDescription(story) }
        </ScrollView>
      </View>
    )
  }

  render() {
    const { story, modalVisible, onRequestClose, ...props } = this.props;

    return (
      <Modal
        {...props}
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={onRequestClose}>

        { this._renderModelContent(story) }
      </Modal>
    )
  }

}

const styles = StyleSheet.create({
  imageWrapper: {
    height: 200,
    borderColor: '#eee',
    borderWidth: 0.5,
    borderRadius: 3,
    alignItems: 'center',
  },
  image: {
    width: 180,
    height: 200,
    marginRight: 20,
  },
  descriptionTitle: {
    color: 'green',
    textDecorationLine: 'underline',
  },
  btnDownload: {
    marginTop: 24,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#E4145C',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shortInfo: {
    flexDirection: 'row',
    padding: 24,
  },
  tagsWrapper: {
    flexDirection:'row',
    flexWrap:'wrap',
    marginTop: 8,
  }
});
