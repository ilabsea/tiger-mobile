import React, {Component} from 'react';
import {
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
  Image,
  ListView,
  RefreshControl,
  Alert,
  TouchableOpacity,
  AsyncStorage,
} from 'react-native';

import { Toolbar, Icon, Card } from 'react-native-material-ui';
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

export default class Labrary extends Component {
  _data = [];
  _currentPage = 0;
  _totalPage = 0;

  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      dataSource: new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 }),
      modalVisible: false,
      story: {tags: []},
    };
  }

  componentDidMount() {
    this._onRefresh();
    this._handleClickReadNowFromHome();
    YellowBox.ignoreWarnings(['Warning: isMounted(...) is deprecated', 'Module RCTImageLoader']);
  }

  _handleClickReadNowFromHome() {
    if(!!this.props.story) {
      let item = realm.objects('Story').filtered(`id=${this.props.story.id}`)[0];
      this._showModal(item);
    }
  }

  _onRefresh() {
    this._currentPage = 0;
    this._data = [];
    this._getStories();
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
      dataSource: this.state.dataSource.cloneWithRows(this._data)
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

        let obj = realm.objects('StoryRead').filtered(`storyId=${story.id}`);
        console.log('==========StoryRead', obj);
      })
    });
  }

  _renderItem(item) {
    let tags = item.tags.map((tag, index) => {
      return (
        <Text key={index} style={storyStyle.tag}>{tag.title}</Text>
      )
    })

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
              {item.title}
            </Text>

            <Text>{I18n.t('author')}: {item.author}</Text>
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

  _renderList() {
    return (
      <ListView
        dataSource={this.state.dataSource}
        renderRow={(rowData) => this._renderItem(rowData)}
        enableEmptySections={ true }
        style={{flex: 1, paddingBottom: 16}}
        contentContainerStyle={{paddingBottom: 16}}
        refreshControl={
          <RefreshControl
            refreshing={ false }
            onRefresh={ () => this._onRefresh() }
          />
        }
        onEndReached={ () => this._onEndReached() }
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
    padding: 16,
  },
  menuOption: {
    padding: 10
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 3,
    borderWidth: 1,
    borderRadius: 2,
    borderColor: '#ddd',
    margin: 16,
    marginBottom: 0,
  }
});
