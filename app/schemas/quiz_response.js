'use strict';

import Realm from 'realm';

export default class QuizResponse extends Realm.Object {}

QuizResponse.schema = {
  name: 'QuizResponse',
  primaryKey: 'uuid',
  properties: {
    uuid: 'string',
    questionId: 'int',
    choiceId: 'int',
    storyId: 'int',
    storyReadUuid: 'string',
  }
}
