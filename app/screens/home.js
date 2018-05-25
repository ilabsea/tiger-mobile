import React, {Component} from 'react';
import {
  Text,
  View,
  Button,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  FlatList,
  ActivityIndicator,
} from 'react-native';

import {
  Toolbar,
  Icon,
  COLOR,
} from 'react-native-material-ui';

import I18n from '../i18n/i18n';
import headerStyle from '../assets/style_sheets/header';
import storyService from '../services/story.service';

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
    };
  }

  componentDidMount() {
    this._getStories();
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

  _onLayout = () => {
    const {width} = Dimensions.get('window');
    const itemWidth = width/2;
    const numColumns = Math.floor(width/itemWidth)
    this.setState({ numColumns: numColumns, itemWidth: itemWidth })
  }

  _renderItem = ({item}) => (
    <View style={[styles.itemWrapper, {width: this.state.itemWidth}]}>
      <View style={styles.item}>
        <Text style={{color: '#fff'}}>{item.title}</Text>
      </View>
    </View>
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
    backgroundColor: '#fff',
    backgroundColor: 'transparent',
    padding: 8,
  },
  item: {
    flex: 1,
    height: 315,
    borderColor: '#fff',
    borderWidth: 1,
  }
});
