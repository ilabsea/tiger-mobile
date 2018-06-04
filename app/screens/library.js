import React, {Component} from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  ListView,
  RefreshControl,
} from 'react-native';

import {
  Toolbar,
  Icon,
  Card
} from 'react-native-material-ui';

import realm from '../schema';
import I18n from '../i18n/i18n';
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
  }

  _renderItem(item) {
    let tags = item.tags.map((tag, index) => {
      return (
        <Text key={index} style={{marginRight: 5, backgroundColor: '#eee', borderRadius: 3, paddingHorizontal: 4}}>{tag}</Text>
      )
    })

    return (
      <Card style={{}} onPress={()=> this._showModal(item)}>
        <View style={styles.item}>
          <View style={{height: 200, borderColor: '#eee', borderWidth: 0.5, borderRadius: 3, alignItems: 'center'}}>
            <Image
              style={{width: 150, height: 200, marginRight: 16}}
              source={{uri: `file://${item.image}`}}
            />
          </View>

          <View style={styles.flex}>
            <Text
              style={{fontSize: 20}}
              ellipsizeMode='tail'
              numberOfLines={1}
            >
              {item.title}
            </Text>

            <Text style={{color: '#ccc', fontSize: 18}}>Author: {item.author}</Text>

            <View style={{flexDirection:'row', flexWrap:'wrap', marginTop: 8}}>
              {tags}
            </View>
          </View>

          <TouchableOpacity onPress={() => alert('more-vert')}>
            <Icon name="more-vert" size={24} />
          </TouchableOpacity>
        </View>
      </Card>
    )
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
        onRequestClose={() => this.setState({modalVisible: false})}
      ></StoryPreviewModal>
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
  }
});
