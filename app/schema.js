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

export default new Realm({schema: [
  Story,
  StoryBackup,
  Scene,
  SceneAction,
  Question,
  Choice,
  StoryRead,
  StoryResponse,
  QuizResponse,
]});
