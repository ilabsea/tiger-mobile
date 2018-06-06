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
} from 'react-native';

import { Toolbar, Icon, Card } from 'react-native-material-ui';
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';
import { YellowBox } from 'react-native';
import realm from '../schema';
import I18n from '../i18n/i18n';
import uuidv4 from '../utils/uuidv4';
import headerStyle from '../assets/style_sheets/header';
import storyService from '../services/story.service';
import StoryPreviewModal from './story_preview_modal';

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
    this.setState({modalVisible: true, story: item});
    this._handleStoryRead(item);
  }

  _handleStoryRead(story) {
    let storyRead = realm.objects('StoryRead').filtered(`storyId=${story.id} AND finishedAt=NULL`).sorted('createdAt', true)[0];

    realm.write(() => {
      if (!!storyRead) {
        let storyResponses = realm.objects('StoryResponse').filtered(`storyReadUuid='${storyRead.uuid}'`);
        let quizResponses = realm.objects('QuizResponse').filtered(`storyReadUuid='${storyRead.uuid}'`);

        realm.delete(storyResponses);
        realm.delete(quizResponses);
        realm.delete(storyRead);
      }

      realm.create('StoryRead', { uuid: uuidv4(), storyId: story.id, createdAt: new Date() });

      let obj = realm.objects('StoryRead').filtered(`storyId=${story.id}`);
      console.log('==========StoryRead', obj);
    })
  }

  _renderItem(item) {
    let tags = item.tags.map((tag, index) => {
      return (
        <Text key={index} style={styles.tag}>{tag}</Text>
      )
    })

    return (
      <Card>
        <View style={styles.item}>
          <View style={{height: 200, borderColor: '#eee', borderWidth: 0.5, borderRadius: 3, alignItems: 'center'}}>
            <Image
              style={{width: 150, height: 200, marginRight: 16}}
              source={{uri: `file://${item.image}`}}
            />
          </View>

          <View style={styles.flex}>
            <Text
              style={{fontSize: 20, fontFamily: 'KhmerOS'}}
              ellipsizeMode='tail'
              numberOfLines={1}
            >
              {item.title}
            </Text>

            <Text style={styles.author}>{I18n.t('author')}: {item.author}</Text>
            <View style={styles.tagWrapper}>{tags}</View>
          </View>

          <Menu>
            <MenuTrigger>
              <Icon name="more-vert" size={24} />
            </MenuTrigger>

            <MenuOptions>
              <MenuOption onSelect={()=> this._showModal(item)}>
                <Text style={styles.menuOption}>{I18n.t('read_now')}</Text>
              </MenuOption>

              <MenuOption onSelect={() => this._confirmDelete(item)} >
                <Text style={[styles.menuOption, {color: 'red'}]}>{I18n.t('delete')}</Text>
              </MenuOption>
            </MenuOptions>
          </Menu>
        </View>
      </Card>
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

  _deleteStory(story) {
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
        onRequestClose={() => this._closeModal()}
      ></StoryPreviewModal>
    )
  }

  _closeModal() {
    this.setState({modalVisible: false, story: null});
    this.props.onSetStory(null);
  }

  render() {
    if(this.state.isLoading){
      return(
        <View style={{flex: 1, padding: 20}}>
          <ActivityIndicator/>
        </View>
      )
    }

    return (
      <View style={styles.flex}>
        <Toolbar
          centerElement={<Text style={headerStyle.title}>{I18n.t('my_library')}</Text>}
        />

        { this._renderList() }
        { this._renderModal() }
      </View>
    )
  }
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  item: {
    flex: 1,
    minHeight: 232,
    padding: 16,
    flexDirection: 'row',
  },
  menuOption: {
    padding: 10
  },
  tagWrapper: {
    flexDirection:'row',
    flexWrap:'wrap',
    marginTop: 8,
  },
  author: {
    color: '#bbb',
    fontSize: 18
  },
  tag: {
    marginRight: 5,
    backgroundColor: '#eee',
    borderRadius: 3,
    paddingHorizontal: 4,
    color: '#111'
  }
});
