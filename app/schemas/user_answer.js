'use strict';

import Realm from 'realm';

export default class UserAnswer extends Realm.Object {}

UserAnswer.schema = {
  name: 'UserAnswer',
  primaryKey: 'id',
  properties: {
    id: 'int',
    userUuid: 'string',
    questionId: 'int',
    choiceId: 'int'
  }
}
