'use strict';

import Realm from 'realm';

export default class Story extends Realm.Object {}

Story.schema = {
  name: 'Story',
  primaryKey: 'id',
  properties: {
    id: 'int',
    title: 'string',
    description: 'string',
    image: 'string',
    author: 'string',
    hasAudio: { type: 'bool', default: false },
    sourceLink: 'string?',
    license: 'string',
    publishedAt: 'string',
    tags: 'Tag[]',
    scenes: { type: 'list', objectType: 'Scene' },
    questions: { type: 'list', objectType: 'Question' },
    isRead: { type: 'bool', default: false },
    createdAt: 'date'
  }
}
