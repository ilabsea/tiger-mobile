import React, {Component} from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  FlatList,
  ActivityIndicator,
  Image
} from 'react-native';

import { Toolbar, COLOR, Button } from 'react-native-material-ui';
import AwesomeIcon from 'react-native-vector-icons/FontAwesome';
import realm from '../schema';
import I18n from '../i18n/i18n';
import headerStyle from '../assets/style_sheets/header';
import storyStyle from '../assets/style_sheets/story';
import storyService from '../services/story.service';
import StoryModal from './story_modal';

export default class Home extends Component {
  _data = [];
  _currentPage = 0;
  _totalPage = 0;

  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      refreshing: false,
      dataScource: [],
      modalVisible: false,
      story: {tags: []},
      viewIcon: 'th-list',
      view: 'grid',
    };
  }

  componentDidMount() {
    this._setDownloadedStories();
    this._onRefresh();
  }

  readNow(story) {
    this.setState({modalVisible: false});
    this.props.onSetActive('library');
    this.props.onSetStory(story);
  }

  _setDownloadedStories() {
    this.setState({downloadedStories: realm.objects('Story').map(story => story.id)})
  }

  _onRefresh() {
    this._currentPage = 0;
    this._data = [];
    this._getStories();
  }

  _getStories() {
    this._currentPage++;

    storyService.getAll(this._currentPage)
      .then((responseJson) => {
        this._data = this._data.concat(responseJson.data.stories);
        this._totalPage = responseJson.data.meta.pagination.total_pages;
        this.setState({ isLoading: false, dataSource: this._data });
      })
  }

  _showModel(story) {
    let objStory = realm.objects('Story').filtered(`id=${story.id}`)[0];
    this.setState({modalVisible: true, story: story, storyDownloaded: !!objStory});
  }

  _onEndReached() {
    if (this._currentPage == this._totalPage) { return; }

    this._getStories();
  }

  _renderItem = ({item}) => {
    const { width } = Dimensions.get('window');
    let w = width - 16;
    let itemWidth = this.state.view == 'grid' ? w/2 : w;
    let flexDirection = this.state.view == 'grid' ? 'column' : 'row';
    let infoStyle = this.state.view == 'grid' ? {} : storyStyle.listViewInfo

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
              style={{height: 200, flex: 1}}
              source={{uri: `http://192.168.1.107:3000` + item.image}}/>
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
              <Text style={storyStyle.tag}>{!!item.tags[0] && item.tags[0].title}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  _renderContentWithFlatList() {
    let numColumns = this.state.view == 'grid' ? 2 : 1;

    return (
      <View style={{flex: 1, backgroundColor: COLOR.cyan900}}>
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
    this.setState({viewIcon: iconName, view: view});
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
      <View style={{flex: 1}}>
        <Toolbar
          centerElement={<Text style={headerStyle.title}>{I18n.t('home')}</Text>}
          rightElement={
            <TouchableOpacity onPress={() => this._toggleLayout()} style={{paddingHorizontal: 20}}>
              <AwesomeIcon name={this.state.viewIcon} color='#fff' size={24} />
            </TouchableOpacity>
          }
        />

        { this._renderContentWithFlatList() }
        { this._renderModal() }
      </View>
    )
  }
}
