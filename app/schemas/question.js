'use strict';

import Realm from 'realm';

export default class Question extends Realm.Object {}

Question.schema = {
  name: 'Question',
  primaryKey: 'id',
  properties: {
    id: 'int',
    label: 'string',
    displayOrder: 'int?',
    choices: {type: 'list', objectType: 'Choice'},
    message: 'string?',
    storyId: 'int',
    educationalMessageAudio: {type: 'string', default: ''},
    audio: {type: 'string', default: ''}
  }
}
