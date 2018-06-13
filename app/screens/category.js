import React, {Component} from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  FlatList,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  NetInfo,
} from 'react-native';

import { Toolbar, COLOR } from 'react-native-material-ui';
import I18n from '../i18n/i18n';
import headerStyle from '../assets/style_sheets/header';
import storyStyle from '../assets/style_sheets/story';
import categoryService from '../services/category.service';
import storyService from '../services/story.service';
import CategoryModal from './category_modal';

export default class Category extends Component {
  _isOnline = false;
  _data = [];

  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      refreshing: false,
      modalVisible: false,
      dataSource: [],
      category: {},
      stories: [],
    };
  }

  componentDidMount() {
    this._handleInternetConnection();
  }

  readNow(story) {
    this.setState({modalVisible: false});
    this.props.onSetActive('library');
    this.props.onSetStory(story);
  }

  _handleInternetConnection() {
    NetInfo.isConnected.fetch().then(isConnected => {
      this._isOnline = isConnected;
      this._onRefresh();
    });

    NetInfo.isConnected.addEventListener(
      'connectionChange',
      this._handleFirstConnectivityChange
    );
  }

  _handleFirstConnectivityChange = (isConnected) => {
    this._isOnline = isConnected;
  }

  _onRefresh() {
    this._data = [];

    if (!this._isOnline) { return; }

    this._getCategories()
  }

  _getCategories() {
    categoryService.getAll()
      .then((responseJson) => {
        this._data = this._data.concat(responseJson.data.tags);
        this.setState({ isLoading: false, dataSource: this._data });
      })
  }

  _renderItem = ({item}) => {
    const { width } = Dimensions.get('window');
    let itemWidth = (width - 16)/2;

    return (
      <TouchableOpacity
        style={{padding: 8, width: itemWidth}}
        onPress={()=> this._showModel(item)}>
        <View style={styles.item}>
          <View style={[styles.icon, {backgroundColor: item.color}]}>
          </View>

          <View style={{flex: 1}}>
            <Text
              style={[{color: '#111'}]}
              ellipsizeMode='tail'
              numberOfLines={1}>
              {item.title}
            </Text>

            <Text style={[storyStyle.author, {color: COLOR.green700}]}>{item.stories_count} {I18n.t('book')}</Text>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  _renderContentWithFlatList() {
    return (
      <View style={{flex: 1}}>
        <FlatList
          data={this.state.dataSource}
          keyExtractor={(item, index) => index.toString()}
          key={2}
          numColumns={2}
          renderItem={this._renderItem}
          onEndReachedThreshold={0.1}
          onEndReached={() => {}}
          refreshing={this.state.refreshing}
          contentContainerStyle={{padding: 8}}
          onRefresh={() => this._onRefresh()}
        />
      </View>
    )
  }

  _renderModal() {
    return (
      <CategoryModal
        modalVisible={this.state.modalVisible}
        category={this.state.category}
        stories={this.state.stories}
        isOnline={this._isOnline}
        onRequestClose={() => {
          this.setState({modalVisible: false});
        }}
        readNow={(story) => this.readNow(story)}
      ></CategoryModal>
    )
  }

  _showModel(category) {
    storyService.getAllByTag(category.id, 1)
      .then((responseJson) => {
        this.setState({modalVisible: true, category: category, stories: responseJson.data.stories});
      })
  }

  _renderNoData() {
    return (
      <View style={headerStyle.centerChildWrapper}>
        <Text>{I18n.t('no_data')}</Text>
      </View>
    );
  }

  render() {
    return (
      <View style={{flex: 1}}>
        <Toolbar
          centerElement={<Text style={headerStyle.title}>{I18n.t('category')}</Text>}
        />

        { !this.state.dataSource.length && this._renderNoData() }
        { !!this.state.dataSource.length && this._renderContentWithFlatList() }
        { this._renderModal() }
      </View>
    )
  }
}

const styles = StyleSheet.create({
  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 16,
  },
  item: {
    flexDirection: 'column',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 3,
    borderWidth: 1,
    borderRadius: 2,
    borderColor: '#ddd',
  }
});
