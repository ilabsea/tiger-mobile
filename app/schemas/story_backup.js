'use strict';

import Realm from 'realm';

export default class StoryBackup extends Realm.Object {}

StoryBackup.schema = {
  name: 'StoryBackup',
  primaryKey: 'id',
  properties: {
    id: 'int',
    title: 'string',
    description: 'string',
    image: 'string',
    author: 'string',
    sourceLink: 'string?',
    publishedAt: 'string',
    tags: 'Tag[]',
    createdAt: 'date'
  }
}
