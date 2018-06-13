import React, {Component} from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  FlatList,
  Image,
  Modal,
} from 'react-native';

import { Toolbar, COLOR, Button } from 'react-native-material-ui';
import realm from '../schema';
import I18n from '../i18n/i18n';
import headerStyle from '../assets/style_sheets/header';
import storyStyle from '../assets/style_sheets/story';
import storyService from '../services/story.service';
import { environment } from '../environments/environment';
import StoryModal from './story_modal';

export default class CategoryModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      refreshing: false,
      modalVisible: false,
      dataSource: [],
      story: {tags: []},
    };
  }

  componentDidMount() {
    this._setDownloadedStories();
    this._onRefresh();
  }

  _setDownloadedStories() {
    this.setState({downloadedStories: realm.objects('Story').map(story => story.id)})
  }

  _onRefresh() {
  }

  _onEndReached() {
  }

  _closeModal() {
    this.props.onRequestClose();
  }

  _showModel(story) {
    this.setState({modalVisible: true, story: story, storyDownloaded: this.state.downloadedStories.includes(story.id)});
  }

  _renderItem = ({item}) => {
    const { width } = Dimensions.get('window');
    let itemWidth = (width - 16)/2;

    return (
      <TouchableOpacity
        style={{padding: 8, width: itemWidth}}
        onPress={()=> this._showModel(item)}>
        <View style={[storyStyle.item, {flexDirection: 'column'}]}>
          {
            !this.state.downloadedStories.includes(item.id) &&
            <Text style={storyStyle.downloadLabel}>{I18n.t('download')}</Text>
          }

          <View style={storyStyle.imageWrapper}>
            <Image
              style={storyStyle.image}
              source={{uri: `${environment.domain}${item.image}` }}/>
          </View>

          <View style={[{flex: 1}]}>
            <Text
              style={[storyStyle.title]}
              ellipsizeMode='tail'
              numberOfLines={1}>
              {item.title}
            </Text>

            <Text style={storyStyle.author}>{ I18n.t('author') }: {item.author}</Text>

            <View style={storyStyle.tagsWrapper}>
              <Text style={storyStyle.tag}>{!!item.tags[0] && item.tags[0].title}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  _renderContentWithFlatList() {
    return (
      <View style={{flex: 1, backgroundColor: COLOR.cyan900}}>
        <FlatList
          data={this.props.stories}
          keyExtractor={(item, index) => index.toString()}
          key={2}
          numColumns={2}
          renderItem={this._renderItem}
          onEndReachedThreshold={0.1}
          onEndReached={() => this._onEndReached()}
          refreshing={this.state.refreshing}
          contentContainerStyle={{padding: 8}}
          onRefresh={() => this._onRefresh()}
        />
      </View>
    )
  }

  _renderModal() {
    return (
      <StoryModal
        modalVisible={this.state.modalVisible}
        story={this.state.story}
        isOnline={true}
        onRequestClose={() => {
          this.setState({modalVisible: false});
          this._setDownloadedStories();
        }}
        storyDownloaded={this.state.storyDownloaded}
        readNow={(story) => this.props.readNow(story)}
      ></StoryModal>
    )
  }

  _renderModelContent = (category) => {
    return (
      <View style={{flex: 1}}>
        <Toolbar
          leftElement="arrow-back"
          centerElement={<Text style={headerStyle.title}>{!!category && category.title}</Text>}
          onLeftElementPress={() => this.props.onRequestClose()}
        />

        { this._renderContentWithFlatList() }
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
        { this._renderModal() }
      </Modal>
    )
  }
}
