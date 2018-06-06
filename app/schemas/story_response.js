'use strict';

import Realm from 'realm';

export default class StoryResponse extends Realm.Object {}

StoryResponse.schema = {
  name: 'StoryResponse',
  primaryKey: 'uuid',
  properties: {
    uuid: 'string',
    sceneId: 'int',
    sceneActionId: 'int',
    storyId: 'int',
    storyReadUuid: 'string',
  }
}
