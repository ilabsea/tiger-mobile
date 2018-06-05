'use strict';

import Realm from 'realm';

export default class Choice extends Realm.Object {}

Choice.schema = {
  name: 'Choice',
  primaryKey: 'id',
  properties: {
    id: 'int',
    label: 'string',
    answered: { type: 'bool', default: false },
    questionId: 'int',
    storyId: 'int',
  }
}
