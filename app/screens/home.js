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

import {
  Toolbar,
  Icon,
  COLOR,
} from 'react-native-material-ui';

import realm from '../schema';
import I18n from '../i18n/i18n';
import headerStyle from '../assets/style_sheets/header';
import storyService from '../services/story.service';
import StoryModal from './story_modal';

let currentPage = 1;
let perPage = 4;
let totalPage = 0;
let loading = false;

export default class Home extends Component {
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
    this._getStories();
  }

  showModel(story) {
    let objStory = realm.objects('Story').filtered(`id=${story.id}`)[0];
    this.setState({modalVisible: true, story: story, storyDownloaded: !!objStory});
  }

  _getStories = () => {
    currentPage = 1;

    storyService.getAll()
      .then((responseJson) => {
        this.setState({
          isLoading: false,
          dataSource: responseJson.data.stories
        });

        totalPage = responseJson.data.meta.pagination.total_pages;
      })
  }

  _onScrollDown = () => {
    if (currentPage == totalPage || loading) { return; }

    loading = true;
    currentPage++;

    storyService.getAll(currentPage).then((responseJson) => {
      let data = this.state.dataSource.concat(responseJson.data.stories);
      this.setState({ isLoading: false, dataSource: data});
      loading = false;
    })
  }

  _onLayout = (event) => {
    const {width} = Dimensions.get('window');
    // const {width} = event.nativeEvent.layout;
    const itemWidth = width/2;
    const numColumns = Math.floor(width/itemWidth)
    this.setState({ numColumns: numColumns, itemWidth: itemWidth })
  }

  _renderItem = ({item}) => (
    <TouchableOpacity
      style={[styles.itemWrapper, {width: this.state.itemWidth}]}
      onPress={()=> this.showModel(item)}
    >
      <View style={styles.item}>
        <View style={{height: 200, borderColor: '#eee', borderWidth: 0.5, borderRadius: 3, alignItems: 'center'}}>
          <Image
            style={{width: 200, height: 200}}
            source={{uri: "http://192.168.1.107:3000" + item.image}}
          />
        </View>

        <Text
          style={{color: '#fff', fontSize: 20}}
          ellipsizeMode='tail'
          numberOfLines={1}
        >
          {item.title}
        </Text>

        <Text style={{color: '#fff', fontSize: 18}}>Author: {item.user.email.split('@')[0]}</Text>

        <View style={{flexDirection:'row', flexWrap:'wrap', marginTop: 8}}>
          <Text style={{backgroundColor: '#eee', borderRadius: 3, paddingHorizontal: 4}}>{!!item.tags[0] && item.tags[0].title}</Text>
        </View>
      </View>
    </TouchableOpacity>
  )

  _renderContentWithFlatList() {
    return (
      <View
        style={styles.container}
        contentContainerStyle={{flex:1, alignItems: 'center'}}
        onLayout={this._onLayout} >

        <FlatList
          data={this.state.dataSource}
          keyExtractor={(item, index) => index.toString()}
          key={this.state.numColumns}
          numColumns={this.state.numColumns}
          renderItem={this._renderItem}
          onEndReachedThreshold={0.1}
          onEndReached={this._onScrollDown}
          refreshing={this.state.refreshing}
          onRefresh={this._getStories}
        />
      </View>
    )
  }

  _renderModal() {
    return (
      <StoryModal
        modalVisible={this.state.modalVisible}
        story={this.state.story}
        onRequestClose={() => this.setState({modalVisible: false})}
        storyDownloaded={this.state.storyDownloaded}
        readNow={() => this.readNow()}
      ></StoryModal>
    )
  }

  readNow() {
    this.setState({modalVisible: false});
    this.props.onSetActive('library');
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
  }
});
