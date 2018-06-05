'use strict';

import Realm from 'realm';

export default class SceneAction extends Realm.Object {}

SceneAction.schema = {
  name: 'SceneAction',
  primaryKey: 'id',
  properties: {
    id: 'int',
    name: 'string',
    display_order: 'int?',
    sceneId: 'int',
    linkScene: 'Scene',
    storyId: 'int'
  }
}
