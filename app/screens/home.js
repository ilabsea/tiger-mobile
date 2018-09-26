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
} from 'react-native';

import RNFS from 'react-native-fs';
import { Toolbar, COLOR, Button, Icon } from 'react-native-material-ui';
import AwesomeIcon from 'react-native-vector-icons/FontAwesome';
import realm from '../schema';
import I18n from '../i18n/i18n';
import headerStyle from '../assets/style_sheets/header';
import storyStyle from '../assets/style_sheets/story';
import storyService from '../services/story.service';
import layoutSerive from '../services/layout.service';
import StoryModal from './story_modal';
import { environment } from '../environments/environment';

export default class Home extends Component {
  _data = [];
  _currentPage = 0;
  _totalPage = 0;

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
    this._handleInternetConnection();

    layoutSerive.get((view) => {
      let viewIcon = view == 'grid' ? 'th-list' : 'th-large';
      this.setState({view: view, viewIcon: viewIcon});
    })
    this._setDownloadedStories();
  }

  readNow(story) {
    this.setState({modalVisible: false});
    this.props.onSetActive('library');
    this.props.onSetStory(story);
  }

  _handleInternetConnection() {
    NetInfo.isConnected.fetch().then(isConnected => {
      this.setState({isOnline: isConnected});
      this._onRefresh(isConnected);
    });

    NetInfo.isConnected.addEventListener(
      'connectionChange',
      this._handleFirstConnectivityChange
    );
  }

  _handleFirstConnectivityChange = (isConnected) => {
    if (!this.refs.home) { return; }

    this.setState({modalVisible: false, isOnline: isConnected});
    this._onRefresh(isConnected);
  }

  _setDownloadedStories() {
    this.setState({downloadedStories: realm.objects('Story').map(story => story.id)})
  }

  _onRefresh(isConnected=false) {
    this._currentPage = 0;
    this._data = [];

    if (isConnected || this.state.isOnline) {
      this._currentPage++;

      storyService.getAll(this._currentPage)
        .then((response) => response.json())
        .then((responseJson) => {
          this._data = [].concat(responseJson.stories);
          this._totalPage = responseJson.meta.pagination.total_pages;
          this.setState({ isLoading: false, dataSource: this._data });
          this._handleBackupStories();
        })
        .catch((error) =>{
          console.error(error);
        });

      return;
    }

    this._getOfflineStories();
  }

  _getOfflineStories() {
    this._currentPage++;

    let allStories = realm.objects('StoryBackup').sorted('publishedAt', true);
    let start = (this._currentPage - 1) * storyService.perPage;
    let end = this._currentPage * storyService.perPage;
    let stories = allStories.slice(start, end);

    this._data = this._data.concat(stories);
    this._totalPage = Math.round(allStories.length / storyService.perPage);
    this.setState({ isLoading: false, dataSource: this._data });
  }

  _getStories() {
    this._currentPage++;
    console.log('===================_getStoriesOut');

    storyService.getAll(this._currentPage)
      .then((response) => response.json())
      .then((responseJson) => {
        this._data = this._data.concat(responseJson.stories);
        this._totalPage = responseJson.meta.pagination.total_pages;
        this.setState({ isLoading: false, dataSource: this._data });
        this._handleBackupStories();
      })
      .catch((error) =>{
        console.error(error);
      });
  }

  _handleBackupStories() {
    let stories = realm.objects('StoryBackup');

    realm.write(() => {
      // realm.delete(stories);

      this._data.map((story) => {
        realm.create('StoryBackup', this._buildStory(story), true);
        this._downloadFile(story);
      })
    })
  }

  _buildStory = (story) => {
    let tags = story.tags.map((tag) => {
      return {
        id: tag.id,
        title: tag.title
      }
    })

    return {
      id: story.id,
      title: story.title,
      description: story.description,
      image: '',
      author: story.author,
      sourceLink: story.source_link,
      publishedAt: story.published_at,
      tags: tags,
      createdAt: new Date()
    };
  }

  _downloadFile(story) {
    let image = story.image;
    let url = `${environment.domain}${image}`;
    let fileName = image.split('/').slice(-1)[0];
    let downloadDest = `${RNFS.CachesDirectoryPath}/${fileName}`;
    let ret = RNFS.downloadFile({ fromUrl: url, toFile: downloadDest });

    ret.promise.then(res => {
      realm.write(() => {
        let obj = realm.objects('StoryBackup').filtered(`id=${story.id}`)[0];
        obj.image = downloadDest;
      })
    }).catch(err => {
    });
  }

  _showModel(story) {
    let objStory = realm.objects('Story').filtered(`id=${story.id}`)[0];
    this.setState({modalVisible: true, story: story, storyDownloaded: !!objStory});
  }

  _onEndReached() {
    if (this._currentPage == this._totalPage) { return; }
    if (this.state.isOnline) { return this._getStories(); }

    this._getOfflineStories();
  }

  _renderItem = ({item}) => {
    const { width } = Dimensions.get('window');
    let w = width - 16;
    let itemWidth = this.state.view == 'grid' ? w/2 : w;
    let flexDirection = this.state.view == 'grid' ? 'column' : 'row';
    let infoStyle = this.state.view == 'grid' ? {} : storyStyle.listViewInfo
    let HOST = this.state.isOnline ? environment.domain : 'file://'

    return (
      <TouchableOpacity
        style={{padding: 8, width: itemWidth}}
        onPress={()=> this._showModel(item)}>
        <View style={[storyStyle.item, {flexDirection: flexDirection}]}>
          {
            !this.state.downloadedStories.includes(item.id) &&
            <Text style={storyStyle.downloadLabel}>{I18n.t('download')}</Text>
          }

          <View style={storyStyle.imageWrapper}>
            <Image
              style={storyStyle.image}
              source={{uri: `${HOST}${item.image}` }}/>
          </View>

          <View style={[{flex: 1}, infoStyle]}>
            <Text
              style={[storyStyle.title]}
              ellipsizeMode='tail'
              numberOfLines={1}>
              {item.title}
            </Text>

            <Text style={storyStyle.author}>{ I18n.t('author') }: {item.author}</Text>

            <View style={storyStyle.tagsWrapper}>
              <Text style={storyStyle.tag}>{item.tags[0] && item.tags[0].title}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  _renderContentWithFlatList() {
    if (!this.state.dataSource.length) {
      return this._renderNoData();
    }

    let numColumns = this.state.view == 'grid' ? 2 : 1;

    return (
      <View style={{flex: 1, backgroundColor: '#fff3df'}}>
        <FlatList
          data={this.state.dataSource}
          keyExtractor={(item, index) => index.toString()}
          key={numColumns}
          numColumns={numColumns}
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
        isOnline={this.state.isOnline}
        onRequestClose={() => {
          this.setState({modalVisible: false});
          this._setDownloadedStories();
        }}
        storyDownloaded={this.state.storyDownloaded}
        readNow={(story) => this.readNow(story)}
      ></StoryModal>
    )
  }

  _toggleLayout() {
    let iconName = this.state.viewIcon == 'th-list' ? 'th-large' : 'th-list';
    let view = this.state.view == 'grid' ? 'list' : 'grid';
    layoutSerive.set(view);
    this.setState({viewIcon: iconName, view: view});
  }

  _renderNoData() {
    return (
      <View style={headerStyle.centerChildWrapper}>
        <Text>{I18n.t('no_data')}</Text>
      </View>
    );
  }

  _openUserTypeDialog = () => {
    alert('usertype');
  }

  render() {
    return (
      <View style={{flex: 1}} ref="home">
        <Toolbar
          centerElement={<Text style={headerStyle.title}>{I18n.t('home')}</Text>}
          rightElement={
            <View style={{flexDirection: 'row'}}>
              <TouchableOpacity onPress={() => this._toggleLayout()} style={{paddingHorizontal: 8}}>
                <AwesomeIcon name={this.state.viewIcon} color='#fff' size={24} />
              </TouchableOpacity>

              <TouchableOpacity onPress={this._openUserTypeDialog} style={{paddingHorizontal: 8}}>
                <Icon name='person' color='#fff' size={24} />
              </TouchableOpacity>
            </View>
          }
        />

        { this.state.isLoading &&
          <View style={[headerStyle.centerChildWrapper]}>
            <ActivityIndicator/>
          </View>
        }

        { !this.state.isLoading && this._renderContentWithFlatList() }
        { this._renderModal() }
      </View>
    )
  }
}
