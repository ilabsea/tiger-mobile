'use strict';

import Realm from 'realm';

export default class Scene extends Realm.Object {}

Scene.schema = {
  name: 'Scene',
  primaryKey: 'id',
  properties: {
    id: 'int',
    name: 'string',
    description: 'string',
    image: 'string?',
    visibleName: {type: 'bool', default: true},
    imageAsBackground: {type: 'bool', default: false},
    storyId: 'int',
    sceneActions: 'SceneAction[]',
  }
}
