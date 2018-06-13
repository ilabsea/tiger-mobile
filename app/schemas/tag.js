'use strict';

import Realm from 'realm';

export default class Tag extends Realm.Object {}

Tag.schema = {
  name: 'Tag',
  primaryKey: 'id',
  properties: {
    id: 'int',
    title: 'string'
  }
}
