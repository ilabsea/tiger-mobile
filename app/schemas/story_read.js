'use strict';

import Realm from 'realm';

export default class StoryRead extends Realm.Object {}

StoryRead.schema = {
  name: 'StoryRead',
  primaryKey: 'uuid',
  properties: {
    uuid: 'string',
    storyId: 'int',
    finishedAt: 'date?',
    isQuizFinished: { type: 'bool', default: false },
    isUploaded: { type: 'bool', default: false },
    createdAt: 'date',
  }
}
