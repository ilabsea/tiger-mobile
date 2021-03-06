import React, {Component} from 'react';
import {
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
  Image,
  FlatList,
  RefreshControl,
  Alert,
  TouchableOpacity,
  Linking,
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { Toolbar, Icon, Card, Divider } from 'react-native-material-ui';
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';
import { YellowBox } from 'react-native';
import realm from '../schema';
import I18n from '../i18n/i18n';
import uuidv4 from '../utils/uuidv4';
import headerStyle from '../assets/style_sheets/header';
import storyStyle from '../assets/style_sheets/story';
import storyService from '../services/story.service';
import StoryPreviewModal from './story_preview_modal';
import { TEXT_SIZE, USER_TYPE } from '../utils/variable';
import { LICENSES } from '../utils/licenses';

export default class Labrary extends Component {
  _data = [];
  _currentPage = 0;
  _totalPage = 0;
  _keyExtractor = (item, index) => index.toString();

  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      stories: [],
      modalVisible: false,
      story: {tags: []},
    };
  }

  componentDidMount() {
    this._getStories();
    this._handleClickReadNowFromHome();
    YellowBox.ignoreWarnings(['Warning: isMounted(...) is deprecated', 'Module RCTImageLoader']);
  }

  _handleClickReadNowFromHome() {
    if(!!this.props.story) {
      let item = realm.objects('Story').filtered(`id=${this.props.story.id}`)[0];
      this._showModal(item);
    }
  }

  _onEndReached() {
    if (this._currentPage == this._totalPage) {
      return;
    }

    this._getStories();
  }

  _getStories = () => {
    this._currentPage++;

    let allStories = realm.objects('Story').sorted('createdAt', true);
    let start = (this._currentPage - 1) * storyService.perPage;
    let end = this._currentPage * storyService.perPage;
    let stories = allStories.slice(start, end);

    this._data = this._data.concat(stories);
    this._totalPage = Math.round(allStories.length / storyService.perPage);
    this.setState({
      isLoading: false,
      stories: this._data
    });
  }

  _showModal(item) {
    AsyncStorage.getItem(TEXT_SIZE).then((textSize) => {
      this.setState({modalVisible: true, story: item, textSize: parseInt(textSize) || 18});
      this._handleStoryRead(item);
    });
  }

  _handleStoryRead(story) {
    let storyRead = realm.objects('StoryRead').filtered(`storyId=${story.id} AND finishedAt=NULL`).sorted('createdAt', true)[0];
    AsyncStorage.getItem(USER_TYPE).then((userType) => {
      realm.write(() => {
        if (!!storyRead) {
          let storyResponses = realm.objects('StoryResponse').filtered(`storyReadUuid='${storyRead.uuid}'`);
          let quizResponses = realm.objects('QuizResponse').filtered(`storyReadUuid='${storyRead.uuid}'`);

          realm.delete(storyResponses);
          realm.delete(quizResponses);
          realm.delete(storyRead);
        }

        realm.create('StoryRead', { uuid: uuidv4(), storyId: story.id, createdAt: new Date(), userType: userType });
      })
    });
  }

  _openLink(url) {
    Linking.openURL(url);
  }

  _renderAcknowledgementOrSourceLink(story) {
    if (!story.sourceLink) {
      return (null);
    }

    let regex = /https?:\/\//g;
    let isLink = !!story.sourceLink.match(regex);

    if (isLink) {
      return(
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Text>{I18n.t('source_link')}: </Text>
          <TouchableOpacity onPress={()=> this._openLink(story.sourceLink)} style={{flex: 1}}>
            <Text style={{color: '#1976d2'}} ellipsizeMode='tail' numberOfLines={1}>{story.sourceLink}</Text>
          </TouchableOpacity>
        </View>
      )
    }

    return (
      <Text>
        <Text>{I18n.t('acknowledgement')}: </Text>
        <Text style={{flex: 1, paddingRight: 8}}>{story.sourceLink}</Text>
      </Text>
    )
  }

  _renderItem(item) {
    let tags;
    if(item.tags){
      tags = item.tags.map((tag, index) => {
        return (
          <Text key={index} style={storyStyle.tag}>{tag.title}</Text>
        )
      })
    }

    let license = LICENSES.filter(license => license.value == item.license)[0];

    return (
      <View style={styles.card}>
        <View style={styles.item}>
          <View style={[storyStyle.imageWrapper, {paddingRight: 16}]}>
            <Image
              style={storyStyle.image}
              source={{uri: `file://${item.image}`}}
            />
          </View>

          <View style={{flex: 1}}>
            <Text
              style={{fontSize: 20}}
              ellipsizeMode='tail'
              numberOfLines={1}
            >
              { item.title }
            </Text>

            <Text>{I18n.t('author')}: {item.author}</Text>
            { this._renderAcknowledgementOrSourceLink(item) }

            { !!license &&
              <View style={storyStyle.tagsWrapper}>
                <Text>{I18n.t('license')}:</Text>
                <TouchableOpacity onPress={() => this._openLink(license.link)}>
                  <Text style={[storyStyle.tag, storyStyle.licenseText]}>{license.display}</Text>
                </TouchableOpacity>

              </View>
            }
            <View style={storyStyle.tagsWrapper}>{tags}</View>

            <View style={{marginTop: 20}}>
              <TouchableOpacity
                onPress={()=> this._showModal(item)}
                style={[storyStyle.btnDownload, storyStyle.btnReadNow, {width: 150}]}>
                <Icon name="book" color='#fff' size={24} />
                <Text style={storyStyle.btnLabel}>{I18n.t('read_now')}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Menu>
            <MenuTrigger>
              <Icon name="more-vert" size={24} />
            </MenuTrigger>

            <MenuOptions style={{borderWidth: 1, borderColor: '#ddd', borderRadius: 3}}>
              <MenuOption onSelect={() => this._confirmDelete(item)} >
                <Text style={[styles.menuOption, {color: 'red'}]}>{I18n.t('delete')}</Text>
              </MenuOption>
            </MenuOptions>
          </Menu>
        </View>
      </View>
    )
  }

  _confirmDelete(story) {
    Alert.alert(
      story.title,
      I18n.t('do_you_want_to_delete_this_story'),
      [
        { text: I18n.t('cancel'), style: 'cancel' },
        { text: I18n.t('yes'), onPress: () => this._deleteStory(story) },
      ],
      { cancelable: true }
    )
  }

  _deleteStory(item) {
    let story = realm.objects('Story').filtered(`id=${item.id}`)[0];

    realm.write(() => {
      let actions = realm.objects('SceneAction').filtered(`storyId=${story.id}`);
      let scenes = realm.objects('Scene').filtered(`storyId=${story.id}`);
      let questions = realm.objects('Question').filtered(`storyId=${story.id}`);
      let choices = realm.objects('Choice').filtered(`storyId=${story.id}`);

      realm.delete(actions);
      realm.delete(scenes);
      realm.delete(choices);
      realm.delete(questions);
      realm.delete(story);
      this._onRefresh();
    });
  }

  _onRefresh() {
    this._currentPage = 0;
    this._data = [];
    this._getStories();
  }

  _renderList() {
    return (
      <FlatList
        data={this.state.stories}
        renderItem={(rowData) => this._renderItem(rowData.item)}
        ItemSeparatorComponent={() => <Divider style={{container: {backgroundColor: '#000'}}} />}
        style={{flex: 1}}
        keyExtractor={this._keyExtractor}
        onEndReachedThreshold={0.1}
        onEndReached={() => this._onEndReached()}
        refreshing={false}
        onRefresh={() => this._onRefresh()}
      />
    )
  }

  _renderModal() {
    return (
      <StoryPreviewModal
        modalVisible={this.state.modalVisible}
        story={this.state.story}
        textSize={this.state.textSize}
        onRequestClose={() => this._closeModal()}
      ></StoryPreviewModal>
    )
  }

  _closeModal() {
    this.setState({modalVisible: false, story: null});
    this.props.onSetStory(null);
  }

  _renderNoData() {
    return (
      <View style={headerStyle.centerChildWrapper}>
        <Text>{I18n.t('no_data')}</Text>
      </View>
    );
  }

  render() {
    if(this.state.isLoading){
      return(
        <View style={[headerStyle.centerChildWrapper, {padding: 20}]}>
          <ActivityIndicator/>
        </View>
      )
    }
    let allStories = realm.objects('Story').sorted('createdAt', true);

    return (
      <View style={{flex: 1, backgroundColor: '#fff3df'}}>
        <Toolbar
          centerElement={<Text style={headerStyle.title}>{I18n.t('my_library')}</Text>}
        />

        { !allStories.length && this._renderNoData() }
        { !!allStories.length && this._renderList() }
        { this._renderModal() }
      </View>
    )
  }
}

const styles = StyleSheet.create({
  item: {
    flex: 1,
    minHeight: 232,
    flexDirection: 'row',
  },
  menuOption: {
    padding: 10
  },
  card: {
    borderRadius: 2,
    borderColor: '#ddd',
    margin: 16,
  }
});
