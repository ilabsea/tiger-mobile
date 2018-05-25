import React, {Component} from 'react';
import {
  Text,
  View,
  Button,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';

import {
  Toolbar,
  Icon,
  COLOR,
} from 'react-native-material-ui';
import I18n from '../i18n/i18n';
import headerStyle from '../assets/style_sheets/header';
import GridLayout from 'react-native-layout-grid';

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

  // // Grid Layout
  // // https://github.com/toystars/react-native-layout-grid
  // renderGridItem = (item) => {
  //   if (!item) {
  //     return ( null )
  //   }
  //   return(
  //       <View style={styles.item}>
  //         <View style={styles.flex} >
  //           <Text style={{color: '#fff'}}>{!!item && item.title}</Text>
  //         </View>
  //       </View>
  //   )
  // }

  // onScroll = (e) => {
  //   var windowHeight = Dimensions.get('window').height,
  //             height = e.nativeEvent.contentSize.height,
  //             offset = e.nativeEvent.contentOffset.y;
  //   // if( windowHeight + offset >= height ){
  //   //     alert('End Scroll')
  //   // }
  // }

  // _renderContentWithScrollView() {
  //   return (
  //     <ScrollView style={styles.container} onScroll={this.onScroll}>
  //       <View style={[styles.scrollContainer]}>
  //         <GridLayout
  //           items={this.state.dataSource}
  //           itemsPerRow={2}
  //           renderItem={this.renderGridItem}
  //         />
  //       </View>
  //     </ScrollView>
  //   )
  // }

  _getStories() {
    currentPage = 1;
    return fetch('http://192.168.1.107:3000/api/v1/stories?per_page='+perPage+'&page='+currentPage)
      .then((response) => response.json())
      .then((responseJson) => {

        this.setState({
          isLoading: false,
          dataSource: responseJson.stories
        });

        totalPage = responseJson.meta.pagination.total_pages;
      })
      .catch((error) =>{
        console.error(error);
      });
  }

  _onLayout = () => {
      const {width} = Dimensions.get('window');
      const itemWidth = width/2;
      const numColumns = Math.floor(width/itemWidth)
      this.setState({ numColumns: numColumns, itemWidth: itemWidth })
  }

  _renderItem = ({item}) => (
    <View style={[styles.itemWrapper, {width: this.state.itemWidth}]}>
      <View style={styles.myItem}>
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
          onRefresh={this._onRefresh}
        />
      </View>
    )
  }

  _onRefresh = () => {
    currentPage=1;
    this.setState({refreshing: true});

    return fetch('http://192.168.1.107:3000/api/v1/stories?per_page='+perPage+'&page=' + currentPage)
      .then((response) => response.json())
      .then((responseJson) => {
        this.setState({
          isLoading: false,
          dataSource: responseJson.stories,
          refreshing: false,
        });

        totalPage = responseJson.meta.pagination.total_pages;
      })
      .catch((error) =>{
        console.error(error);
      });
  }

  _onScrollDown = () => {
    if (currentPage == totalPage || loading) {
      return;
    }
    loading = true;
    currentPage +=1;

    return fetch('http://192.168.1.107:3000/api/v1/stories?per_page='+perPage+'&page=' + currentPage)
      .then((response) => response.json())
      .then((responseJson) => {
        let data = this.state.dataSource.concat(responseJson.stories);

        this.setState({
          isLoading: false,
          dataSource: data,
        });

        loading = false;
      })
      .catch((error) =>{
        console.error(error);
      });
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

        { false && this._renderContentWithScrollView() }
        { true && this._renderContentWithFlatList() }
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
  myItem: {
    flex: 1,
    height: 315,
    borderColor: '#fff',
    borderWidth: 1,
  },
  item: {
    height: 315,
    alignItems: 'center',
    backgroundColor: '#fff',
    backgroundColor: 'transparent',
    padding: 16,
    borderColor: '#fff',
    borderWidth: 1,
  }
});
