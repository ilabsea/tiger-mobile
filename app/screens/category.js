import React, {Component} from 'react';
import {
  Text,
  View,
  ScrollView,
  StyleSheet,
} from 'react-native';

import { Toolbar } from 'react-native-material-ui';
import I18n from '../i18n/i18n';
import headerStyle from '../assets/style_sheets/header';
import categoryService from '../services/category.service';

import Button from '../components/button';
import realm from '../schema';
import statisticService from '../services/statistic.service';

export default class Category extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this._getCategories();
  }

  _getCategories() {
    categoryService.getAll()
      .then((responseJson) => {
        console.log('===============categories', responseJson.data.tags );

        this.setState({categories: responseJson.data.tags});
      })
  }

  render() {
    return (
      <View style={{flex: 1}}>
        <Toolbar
          centerElement={<Text style={headerStyle.title}>{I18n.t('category')}</Text>}
        />

        <ScrollView style={{flex: 1}}>
          <Text>Category</Text>
        </ScrollView>
      </View>
    )
  }
}

const styles = StyleSheet.create({

});
