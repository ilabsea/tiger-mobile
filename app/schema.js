// https://stackoverflow.com/questions/40195371/how-to-organize-react-native-with-realm-project-files
// https://github.com/realm/realm-js/blob/master/examples/ReactExample/components/todo-app.js

'use strict';

import Realm from 'realm';
import Story from './schemas/story';
import StoryBackup from './schemas/story_backup';
import Scene from './schemas/scene';
import SceneAction from './schemas/scene_action';
import Question from './schemas/question';
import Choice from './schemas/choice';
import StoryRead from './schemas/story_read';
import StoryResponse from './schemas/story_response';
import QuizResponse from './schemas/quiz_response';
import Tag from './schemas/tag';
import migrateImage from './utils/migrate_image';

const schema1 = [
  Story,
  StoryBackup,
  Scene,
  SceneAction,
  Question,
  Choice,
  StoryRead,
  StoryResponse,
  QuizResponse,
  Tag
];

function migration1(oldRealm, newRealm) {
  if (oldRealm.schemaVersion < 1) {
    const oldObjects = oldRealm.objects('Story');
    const newObjects = newRealm.objects('Story');

    for (let i = 0; i < oldObjects.length; i++) {
      newObjects[i].license = 'Creative Commons license family - cc';
    }
  }
}

function migration3(oldRealm, newRealm) {
  if (oldRealm.schemaVersion < 3) {
    migrateImage('Story', oldRealm, newRealm);
    migrateImage('Scene', oldRealm, newRealm);
  }
}

const schemas = [
  { schema: schema1, schemaVersion: 1, migration: migration1 },
  { schema: schema1, schemaVersion: 2 },
  { schema: schema1, schemaVersion: 3, migration: migration3},
]

// the first schema to update to is the current schema version
// since the first schema in our array is at
let nextSchemaIndex = Realm.schemaVersion(Realm.defaultPath);
while (nextSchemaIndex < schemas.length) {
  const migratedRealm = new Realm({ ...schemas[nextSchemaIndex] });
  nextSchemaIndex += 1;
  migratedRealm.close();
}

export default new Realm(schemas[schemas.length-1]);
