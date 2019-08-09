import realm from '../schema';
import statisticService from './statistic.service';

export default {
  upload(index=0) {
    let obj = realm.objects('StoryRead').filtered('finishedAt != $0', null)[index];
    if (!obj) { return; }

    statisticService.uploadStoryRead(this._buildData(obj))
      .then((responseJson) => {
        if (responseJson.ok) {
          this._deleteRecord(obj);
          this.upload();
        } else {
          console.log('------------------uploadError');
        }
      })
  },
  _deleteRecord(obj) {
    realm.write(() => {
      let storyResponses = realm.objects('StoryResponse').filtered(`storyReadUuid='${obj.uuid}'`);
      let quizResponses = realm.objects('QuizResponse').filtered(`storyReadUuid='${obj.uuid}'`);

      realm.delete(storyResponses);
      realm.delete(quizResponses);
      realm.delete(obj);
    })
  },

  _buildData(storyRead) {
    return {
      story_id: storyRead.storyId,
      user_uuid: '12345',
      user_type: storyRead.userType,
      finished_at: storyRead.finishedAt,
      quiz_finished: storyRead.isQuizFinished,
      story_responses_attributes: this._buildStoryResponses(storyRead.uuid),
      quiz_responses_attributes: this._buildQuizResponses(storyRead.uuid)
    };
  },

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
  },

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
}
