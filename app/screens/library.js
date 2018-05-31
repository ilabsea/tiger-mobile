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
import StoryModal from './story_modal';

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

    storyService.getAll(this._currentPage)
      .then((responseJson) => {
        this._data = this._data.concat(responseJson.data.stories);
        this._totalPage = responseJson.data.meta.pagination.total_pages;
        this.setState({
          isLoading: false,
          dataSource: this.state.dataSource.cloneWithRows(this._data)
        });
      })
  }

  _renderItem(item) {
    return (
      <Card style={{}} onPress={()=> {alert('click card')}}>
        <View style={styles.item}>
          <View style={{height: 200, borderColor: '#eee', borderWidth: 0.5, borderRadius: 3, alignItems: 'center'}}>
            <Image
              style={{width: 150, height: 200, marginRight: 16}}
              source={{uri: "http://192.168.1.107:3000" + item.image}}
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

            <Text style={{color: '#ccc', fontSize: 18}}>Author: {item.user.email.split('@')[0]}</Text>

            <View style={{flexDirection:'row', flexWrap:'wrap', marginTop: 8}}>
              <Text style={{backgroundColor: '#eee', borderRadius: 3, paddingHorizontal: 4, marginRight: 4}}>{!!item.tags[0] && item.tags[0].title}</Text>
              <Text style={{backgroundColor: '#eee', borderRadius: 3, paddingHorizontal: 4, marginRight: 4}}>{!!item.tags[1] && item.tags[1].title}</Text>
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
