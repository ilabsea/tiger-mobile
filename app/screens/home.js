import React, {Component} from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  FlatList,
  ActivityIndicator,
  Image,
} from 'react-native';

import { Toolbar, COLOR } from 'react-native-material-ui';
import realm from '../schema';
import I18n from '../i18n/i18n';
import headerStyle from '../assets/style_sheets/header';
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
    if (this._currentPage == this._totalPage) {
      return;
    }

    this._getStories();
  }

  _onLayout(event) {
    const {width} = Dimensions.get('window');
    const itemWidth = width/2;
    const numColumns = Math.floor(width/itemWidth);
    this.setState({ numColumns: numColumns, itemWidth: itemWidth });
  }

  _renderItem = ({item}) => {
    // @Todo: handle class for switch view as grid and list
    return (
      <TouchableOpacity
        style={[styles.itemWrapper, {width: this.state.itemWidth}]}
        onPress={()=> this._showModel(item)}>

        <View style={styles.item}>
          { !this.state.downloadedStories.includes(item.id) && <Text style={styles.downloadLabel}>{I18n.t('download')}</Text> }

          <View style={{height: 200, borderColor: '#eee', borderWidth: 0.5, borderRadius: 3, alignItems: 'center'}}>
            <Image
              style={{width: 200, height: 200}}
              source={{uri: "http://192.168.1.107:3000" + item.image}}/>
          </View>

          <Text
            style={{color: '#fff', fontSize: 20}}
            ellipsizeMode='tail'
            numberOfLines={1}> {item.title} </Text>

          <Text style={{color: '#fff', fontSize: 18}}>{ I18n.t('author') }: {item.author}</Text>

          <View style={{flexDirection:'row', flexWrap:'wrap', marginTop: 8}}>
            <Text style={styles.tag}>{!!item.tags[0] && item.tags[0].title}</Text>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  _renderContentWithFlatList() {
    return (
      <View
        style={styles.container}
        contentContainerStyle={{flex:1, alignItems: 'center'}}
        onLayout={() => this._onLayout()} >

        <FlatList
          data={this.state.dataSource}
          keyExtractor={(item, index) => index.toString()}
          key={this.state.numColumns}
          numColumns={this.state.numColumns}
          renderItem={this._renderItem}
          onEndReachedThreshold={0.1}
          onEndReached={() => this._onEndReached()}
          refreshing={this.state.refreshing}
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
          centerElement={<Text style={headerStyle.title}>{I18n.t('home')}</Text>}
        />

        { this._renderContentWithFlatList() }
        { this._renderModal() }
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLOR.cyan900,
  },
  scrollContainer: {
    flex: 1,
    margin: 4,
  },
  flex: {
    flex: 1,
  },
  itemWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    padding: 8,
  },
  item: {
    flex: 1,
    height: 300,
    position: 'relative',
  },
  tag: {
    backgroundColor: '#eee',
    borderRadius: 3,
    paddingHorizontal: 4,
    color: '#111'
  },
  downloadLabel: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'red',
    zIndex: 1,
    color: '#fff',
    paddingHorizontal: 5,
    paddingBottom: 5,
    borderBottomLeftRadius: 5,
  }
});
