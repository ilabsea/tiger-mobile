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
    // this._getCategories();
  }

  _getCategories() {
    categoryService.getAll()
      .then((responseJson) => {
        console.log('===============categories', responseJson.data.tags );

        this.setState({categories: responseJson.data.tags});
      })
  }

  // ----------------------------Story upload start
  _renderBtnUpload() {
    let obj = realm.objects('StoryRead').filtered('finishedAt != $0', null);
    console.log('==========StoryRead', obj);

    return (
      <Button
        onPress={()=> this._upload()}
        title={ 'Upload' }
      />
    )
  }

  _upload(index=0) {
    let obj = realm.objects('StoryRead').filtered('finishedAt != $0', null)[index];
    if (!obj) { return; }

    statisticService.uploadStoryRead(this._buildData(obj))
      .then((responseJson) => {
        if (responseJson.ok) {
          this._deleteRecord(obj);
          this._upload();
        } else {
          console.log('------------------uploadError');
        }
      })
  }

  _deleteRecord(obj) {
    realm.write(() => {
      let storyResponses = realm.objects('StoryResponse').filtered(`storyReadUuid='${obj.uuid}'`);
      let quizResponses = realm.objects('QuizResponse').filtered(`storyReadUuid='${obj.uuid}'`);

      realm.delete(storyResponses);
      realm.delete(quizResponses);
      realm.delete(obj);
    })
  }

  _buildData(storyRead) {
    return {
      story_id: storyRead.storyId,
      user_uuid: '12345',
      finished_at: storyRead.finishedAt,
      quiz_finished: storyRead.isQuizFinished,
      story_responses_attributes: this._buildStoryResponses(storyRead.uuid),
      quiz_responses_attributes: this._buildQuizResponses(storyRead.uuid)
    };
  }

  _buildStoryResponses(storyReadUuid) {
    let arr = realm.objects('StoryResponse').filtered(`storyReadUuid='${storyReadUuid}'`)

    return (
      arr.map((obj) => {
        return {
          scene_id: obj.sceneId,
          scene_action_id: obj.sceneActionId
        }
      })
    );
  }

  _buildQuizResponses(storyReadUuid) {
    let arr = realm.objects('QuizResponse').filtered(`storyReadUuid='${storyReadUuid}'`)

    return (
      arr.map((obj) => {
        return {
          question_id: obj.questionId,
          choice_id: obj.choiceId
        }
      })
    );
  }

  // ---------------Story upload end

  render() {
    return (
      <View style={{flex: 1}}>
        <Toolbar
          centerElement={<Text style={headerStyle.title}>{I18n.t('category')}</Text>}
        />

        <ScrollView style={{flex: 1}}>
          <Text>Category</Text>
          { this._renderBtnUpload() }
        </ScrollView>
      </View>
    )
  }
}

const styles = StyleSheet.create({

});
