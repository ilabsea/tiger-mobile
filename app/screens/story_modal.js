import React, {Component} from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  TouchableHighlight,
  Image,
  Modal,
  ScrollView,
} from 'react-native';

import { Toolbar, Icon } from 'react-native-material-ui';
import RNFS from 'react-native-fs';
import * as Progress from 'react-native-progress';
import I18n from '../i18n/i18n';
import headerStyle from '../assets/style_sheets/header';
import realm from '../schema';
import sceneService from '../services/scene.service';
import questionService from '../services/question.service';
import statisticService from '../services/statistic.service';

let jobId = -1;
let images = [];

export default class StoryModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showReadNow: false,
      showProgress: false,
    }
  }

  _getFullDate(createdAt) {
    let days = ['អាទិត្យ', 'ច័ន្ទ', 'អង្គារ', 'ពុធ', 'ព្រហស្បតិ៍', 'សុក្រ', 'សៅរ៍'];
    let months = ['មករា', 'កុម្ភៈ', 'មិនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្តដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'];
    let time = new Date(createdAt);
    return "ថ្ងៃ" + days[time.getDay()] + ' ទី' + time.getDate() + ' ខែ' + months[time.getMonth()] + ' ឆ្នាំ' + time.getFullYear();
  }

  _buildStory = (story) => {
    return {
      id: story.id,
      title: story.title,
      description: story.description,
      image: '',
      author: story.author,
      sourceLink: story.source_link,
      publishedAt: story.published_at,
      tags: story.tags.map(tag => tag.title),
      createdAt: new Date()
    };
  }

  _importStory(story) {
    realm.create('Story', this._buildStory(story), true);
    images.push(story.image);
  }

  _importScenes(story, scenes) {
    let objStory = realm.objects('Story').filtered(`id=${story.id}`)[0];
    let sceneList = objStory.scenes;

    realm.delete(sceneList);

    scenes.map((scene) => {
      sceneList.push(
        {
          id: scene.id,
          name: scene.name,
          image: '',
          visibleName: scene.visible_name,
          description: scene.description,
          imageAsBackground: scene.image_as_background,
          storyId: scene.story_id,
          isEnd: !!scene.is_end,
        }
      );
    })
  }

  _importSceneActions(scenes) {
    scenes.map((scene) => {
      let objScene = realm.objects('Scene').filtered(`id=${scene.id}`)[0];
      let actionList = objScene.sceneActions;

      realm.delete(actionList);

      scene.scene_actions.map((action) => {
        if (!!action.link_scene.id) {
          let linkScene = realm.objects('Scene').filtered(`id=${action.link_scene.id}`)[0];
          let objAction = realm.create('SceneAction', {
            id: action.id,
            name: action.name,
            displayOrder: action.display_order,
            sceneId: scene.id,
            linkScene: linkScene,
            storyId: scene.story_id,
          }, true)

          actionList.push(objAction);
        }
      })
    });
  }

  _downloadFiles(story, scenes) {
    let scenesList = scenes.filter(s => !!s.image);
    images = [{type: 'Story', id: story.id, url: story.image}];
    scenesList.map((s)=>{ images.push({type: 'Scene', id: s.id, url: s.image}) });
    this.setState({showProgress: true, progress: 0});
    this._downloadFile(0);
  }

  // https://github.com/cjdell/react-native-fs-test/blob/master/index.common.js
  _downloadFile(index) {
    let image = images[index];
    let progress = data => {};
    let begin = res => {};
    let progressDivider = 1;
    let background = false;
    let url = `http://192.168.1.107:3000${image.url}`;
    let fileName = image.url.split('/').slice(-1)[0];
    let downloadDest = `${RNFS.DocumentDirectoryPath}/${fileName}`;

    let ret = RNFS.downloadFile({ fromUrl: url, toFile: downloadDest, begin, progress, background, progressDivider });
    jobId = ret.jobId;

    ret.promise.then(res => {
      realm.write(() => {
        let obj = realm.objects(image.type).filtered(`id=${image.id}`)[0];
        obj.image = downloadDest;
        this.setState({progress: index+1/images.length});
      })

      jobId = -1;

      if (index + 1 < images.length) {
        this._downloadFile(index + 1);
      } else {
        this.setState({showProgress: false, showReadNow: true});
      }
    }).catch(err => {
      jobId = -1;

      if (index + 1 < images.length) {
        this._downloadFile(index + 1);
      } else {
        this.setState({showProgress: false, showReadNow: true});
      }
    });
  }

  _downloadStory(story) {
    sceneService.getAll(story.id)
      .then((responseJson) => {
        realm.write(() => {
          this._importStory(story);
          this._importScenes(story, responseJson.data.scenes);
          this._importSceneActions(responseJson.data.scenes);
          this._downloadFiles(story, responseJson.data.scenes);
        });

        this._getQuizzes(story);
        this._postStatistic(story);
      })
  }

  _postStatistic(story) {
    statisticService.increaseStoryDownload({story_id: story.id, device_type: 'mobile'});
  }

  _importQuestions(story, questions) {
    let objStory = realm.objects('Story').filtered(`id=${story.id}`)[0];
    let questionList = objStory.questions;

    realm.delete(questionList);

    questions.map((question) => {
      let questionDb = realm.create('Question', {
        id: question.id,
        label: question.label,
        displayOrder: question.display_order,
        storyId: question.story_id,
      }, true)

      question.choices.map((choice) => {
        let choiceDb = realm.create('Choice', {
          id: choice.id,
          label: choice.label,
          answered: !!choice.answered,
          questionId: question.id,
          storyId: question.story_id,
        }, true)

        questionDb.choices.push(choiceDb);
      })

      questionList.push(questionDb);
    })
  }

  _getQuizzes(story) {
    questionService.getAll(story.id)
      .then((responseJson) => {
        realm.write(() => {
          this._importQuestions(story, responseJson.data.questions);
        });
      })
  }

  _renderBtnDownload(story) {
    return (
      <View style={{marginTop: 24}}>
        { ( !this.props.storyDownloaded && !this.state.showReadNow ) &&
          <TouchableOpacity
            onPress={()=> this._downloadStory(story)}
            style={styles.btnDownload}
          >
            <Icon name="cloud-download" color='#fff' size={24} />
            <Text style={styles.btnLabel}>{I18n.t('add_to_library')}</Text>
          </TouchableOpacity>
        }

        { this.state.showProgress &&
          <Progress.Pie progress={this.state.progress} color='#E4145C' style={{marginTop: 10}}/>
        }
      </View>
    )
  }

  _renderShortInfo(story) {
    let tags = story.tags.map((tag, index) => {
      return (
        <Text key={index} style={{marginRight: 5, backgroundColor: '#eee', borderRadius: 3, paddingHorizontal: 4}}>{tag.title}</Text>
      )
    })

    return (
      <View style={{flex: 1}}>
        <Text>{I18n.t('published_at')} { this._getFullDate(story.published_at)}</Text>
        <Text style={{fontFamily: 'KhmerOureang'}}>{I18n.t('story_title')} {story.title}</Text>
        <Text>{I18n.t('author')}: {!!story.user && story.user.email.split('@')[0]}</Text>
        <Text style={styles.tagsWrapper}> { tags } </Text>

        { this._renderBtnDownload(story) }
      </View>
    )
  }

  _renderDescription(story) {
    return (
      <View style={{padding: 24}}>
        <Text style={styles.descriptionTitle}>{I18n.t('introduction')}</Text>

        <Text style={{marginTop: 24}}>
          {story.description}
        </Text>
      </View>
    )
  }

  _renderImage(story) {
    return (
      <View style={styles.imageWrapper}>
        <Image
          style={styles.image}
          source={{uri: "http://192.168.1.107:3000" + story.image}}
        />
      </View>
    )
  }

  _renderBtnReadNow(story) {
    return (
      <TouchableOpacity
        onPress={()=> {this.props.readNow(story)}}
        style={[styles.btnDownload, styles.btnReadNow]}
      >
        <Icon name="book" color='#fff' size={24} />
        <Text style={styles.btnLabel}>{I18n.t('read_now')}</Text>
      </TouchableOpacity>
    )
  }

  _renderModelContent = (story) => {
    return (
      <View style={{flex: 1}}>
        <Toolbar
          leftElement="arrow-back"
          centerElement={<Text style={headerStyle.title}>{story.title}</Text>}
          onLeftElementPress={() => this._closeModal()}
        />

        <ScrollView style={{flex: 1}}>
          <View style={styles.shortInfo}>
            { this._renderImage(story) }
            { this._renderShortInfo(story) }
          </View>

          { this._renderDescription(story) }
          { (this.props.storyDownloaded || this.state.showReadNow) && this._renderBtnReadNow(story) }
        </ScrollView>
      </View>
    )
  }

  _closeModal() {
    this.props.onRequestClose();
    this.setState({
      showReadNow: false,
      showProgress: false,
    })
  }

  render() {
    const { story, modalVisible, onRequestClose, ...props } = this.props;

    return (
      <Modal
        {...props}
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => this._closeModal()}>

        { this._renderModelContent(story) }
      </Modal>
    )
  }
}

const styles = StyleSheet.create({
  imageWrapper: {
    height: 200,
    borderColor: '#eee',
    borderWidth: 0.5,
    borderRadius: 3,
    alignItems: 'center',
  },
  image: {
    width: 180,
    height: 200,
    marginRight: 20,
  },
  descriptionTitle: {
    color: 'green',
    textDecorationLine: 'underline',
  },
  btnDownload: {
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#E4145C',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnReadNow: {
    backgroundColor: 'green',
    marginHorizontal: 24,
  },
  btnLabel: {
    color: '#fff',
    marginLeft: 10,
  },
  shortInfo: {
    flexDirection: 'row',
    padding: 24,
  },
  tagsWrapper: {
    flexDirection:'row',
    flexWrap:'wrap',
    marginTop: 8,
  }
});
