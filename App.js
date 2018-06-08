import React, { Component } from 'react';
import Tabs from './app/screens/tabs';
import { NetInfo } from 'react-native';

import realm from './app/schema';
import statisticService from './app/services/statistic.service';

export default class App extends Component {
  componentDidMount() {
    this._handleInternetConnection();
  }

  _handleInternetConnection() {
    NetInfo.isConnected.fetch().then(isConnected => {
      this.setState({isOnline: isConnected});
      this._upload();
    });

    NetInfo.isConnected.addEventListener(
      'connectionChange',
      this._handleFirstConnectivityChange
    );
  }

  _handleFirstConnectivityChange = (isConnected) => {
    if (this.refs.app) {
      this.setState({isOnline: isConnected});
      this._upload();
    }
  }

  _upload(index=0) {
    let obj = realm.objects('StoryRead').filtered('finishedAt != $0', null)[index];
    if (!this.state.isOnline || !obj) { return; }

    statisticService.uploadStoryRead(this._buildData(obj))
      .then((responseJson) => {
        if (responseJson.ok) {
          console.log('==================uploadSuccess');
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

  render() {
    return (<Tabs ref="app"></Tabs>)
  }
}
