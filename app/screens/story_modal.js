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
  ToastAndroid,
  Linking,
  Alert,
  Button
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import NetInfo from "@react-native-community/netinfo";
import { Toolbar, Icon } from 'react-native-material-ui';
import ModalDialog from 'react-native-modal';
import RNFS from 'react-native-fs';
import * as Progress from 'react-native-progress';
import I18n from '../i18n/i18n';
import headerStyle from '../assets/style_sheets/header';
import storyStyle from '../assets/style_sheets/story';
import realm from '../schema';
import sceneService from '../services/scene.service';
import questionService from '../services/question.service';
import statisticService from '../services/statistic.service';
import { environment } from '../environments/environment';
import { USER_TYPE , AUDIOICON } from '../utils/variable';
import { LICENSES } from '../utils/licenses';
import StringHelper from '../utils/string_helper';
import AudioPlayer from '../components/audio_player';
import AudioHelper from '../utils/audio_helper';

export default class StoryModal extends Component {
  images = [];
  sceneAudios = [];
  quizAudios = [];

  constructor(props) {
    super(props);

    this.state = {
      showReadNow: false,
      showProgress: false,
      downloadDialogVisible: false,
      isPlaying: false
    }
  }

  _getFullDate(createdAt) {
    let months = ['មករា', 'កុម្ភៈ', 'មិនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្តដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'];
    let time = new Date(createdAt);
    return 'ថ្ងៃទី' + time.getDate() + ' ' + months[time.getMonth()] + ' ' + time.getFullYear();
  }

  _buildStory = (story) => {
    let tags = story.tags.map((tag) => {
      return {
        id: tag.id,
        title: tag.title
      }
    })
    let imageName = StringHelper.getFileURIName(story.image);
    return {
      id: story.id,
      title: story.title,
      description: story.description,
      image: imageName ? `${RNFS.DocumentDirectoryPath}/${imageName}` : '',
      author: story.author,
      license: story.license,
      sourceLink: story.source_link,
      publishedAt: story.published_at,
      tags: tags,
      createdAt: new Date()
    };
  }

  _importStory(story) {
    realm.create('Story', this._buildStory(story), true);
    this.images.push(story.image);
  }

  _importScenes(story, scenes) {
    let objStory = realm.objects('Story').filtered(`id=${story.id}`)[0];
    let sceneList = objStory.scenes;

    realm.delete(sceneList);

    scenes.map((scene) => {
      let audioName = StringHelper.getFileURIName(scene.audio);
      let imageName = StringHelper.getFileURIName(scene.image);
      sceneList.push(
        {
          id: scene.id,
          name: scene.name,
          image: imageName ? `${RNFS.DocumentDirectoryPath}/${imageName}` : '',
          visibleName: scene.visible_name,
          description: scene.description,
          imageAsBackground: scene.image_as_background,
          storyId: scene.story_id,
          isEnd: !!scene.is_end,
          audio: audioName ? `${RNFS.DocumentDirectoryPath}/${audioName}` : '',
        }
      );
      if(scene.audio){
        this.sceneAudios.push(scene.audio);
      }
      if(scene.image){
        this.images.push(scene.image);
      }
    })
  }

  _importSceneActions(scenes) {
    scenes.map((scene) => {
      let objScene = realm.objects('Scene').filtered(`id=${scene.id}`)[0];
      let actionList = objScene.sceneActions;

      realm.delete(actionList);

      scene.scene_actions.map((action) => {
        if (JSON.stringify(action.link_scene) != '{}') {
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

  _downloadFiles() {
    this.setState({showProgress: true, progress: 0});
    this._downloadFile(0);
  }

  _downloadFile(index) {
    let progress = data => {};
    let begin = res => {};
    let progressDivider = 1;
    let background = false;

    let imagesAudios = this.images.concat(this.sceneAudios, this.quizAudios);
    let fileName = StringHelper.getFileURIName(imagesAudios[index]);

    let options = {
      fromUrl: `${environment.domain}${imagesAudios[index]}`,
      toFile: `${RNFS.DocumentDirectoryPath}/${fileName}`,
      begin,
      progress,
      background,
      progressDivider
    };

    RNFS.downloadFile(options).promise.then(res => {
      this.setState({progress: (index+1)/imagesAudios.length});
      this._handleDownloadProgress(index, imagesAudios.length);
    }).catch(err => {
      this._handleDownloadProgress(index, imagesAudios.length);
    });
  }

  _handleDownloadProgress(index, total) {
    if (index + 1 < total) {
      this._downloadFile(index + 1);
    } else {
      this.setState({showProgress: false, showReadNow: true});
    }
  }

  _handleAutoPlayAudio(){
    let audio = 'download_audio.mp3';
    AsyncStorage.getItem(AUDIOICON, (err, icon) => {
      let isAudioOn = icon == 'volume-up' ? true : false;
      this.setState({isPlaying: isAudioOn});
      if(isAudioOn){
        AudioHelper.handleAudioPlay(audio, (isPlaying) => {
          this.setState({isPlaying: isPlaying});
        });
      }
    })

  }

  _downloadStory(story) {
    if (!this.props.isOnline) {
      return ToastAndroid.show(I18n.t('no_connection'), ToastAndroid.LONG);
    }
    if(story.has_audio){
      this.setState({downloadDialogVisible: true}, () => {
        this._handleAutoPlayAudio()
      });
    }else{
      this._startDownload(story);
    }
  }

  _startDownload(story){
    this.setState({downloadDialogVisible: false}, () => {
      AudioHelper.stopPlaying();
      sceneService.getAll(story.id)
        .then((responseJson) => {
          realm.write(() => {
            this._importStory(story);
            this._importScenes(story, responseJson.data.scenes);
            this._importSceneActions(responseJson.data.scenes);
          });
          this._downloadFiles(story, responseJson.data.scenes);
          this._getQuizzes(story);
          this._postStatistic(story);
        })
    });
  }

  _postStatistic(story) {
    AsyncStorage.getItem(USER_TYPE).then((userType) => {
      statisticService.increaseStoryDownload({story_id: story.id, device_type: 'mobile', user_type: userType});
    });
  }

  _importQuestions(story, questions) {
    let objStory = realm.objects('Story').filtered(`id=${story.id}`)[0];
    let questionList = objStory.questions;

    realm.delete(questionList);

    questions.map((question) => {
      let audioName = StringHelper.getFileURIName(question.audio);
      let eduMsgAudioName = StringHelper.getFileURIName(question.educational_message_audio);
      let questionDb = realm.create('Question', {
        id: question.id,
        label: question.label,
        displayOrder: question.display_order,
        storyId: question.story_id,
        message: question.message,
        educationalMessageAudio: eduMsgAudioName? `${RNFS.DocumentDirectoryPath}/${eduMsgAudioName}` : '',
        audio: audioName ? `${RNFS.DocumentDirectoryPath}/${audioName}` : '',
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
      if(question.audio){
        this.quizAudios.push(question.audio);
      }
      if(question.educational_message_audio){
        this.quizAudios.push(question.educational_message_audio);
      }
    })
  }

  _getQuizzes(story) {
    questionService.getAll(story.id)
      .then((response) => response.json())
      .then((responseJson) => {
        realm.write(() => {
          this._importQuestions(story, responseJson.questions);
        });
      })
  }

  _onCloseModal(){
    this.setState({downloadDialogVisible: false});
    AudioHelper.stopPlaying();
  }

  _toggleAudioPlay(audio){
    AudioHelper._toggleAudioPlay(audio, this.state.isPlaying, (isPlaying) => {
      this.setState({isPlaying: isPlaying});
    })
  }

  _renderDownloadDialog(story){
    let audio = 'download_audio.mp3';
    return(
      <ModalDialog
        isVisible={this.state.downloadDialogVisible}
        onBackdropPress={ () => this._onCloseModal() }
      >
        <View style={{padding: 20, backgroundColor: '#fff'}}>
          <View style={{flexDirection: 'row', marginBottom: 20}}>
            <Text style={{fontSize: 20}}>{I18n.t('the_story_contain_audio')}</Text>
            <AudioPlayer audio={audio}
              isPlaying={this.state.isPlaying}
              color='black'
              size={34}
              onClick={() => this._toggleAudioPlay(audio)}/>
          </View>
            <Text style={{fontSize: 16}}> {I18n.t('the_story_contain_audio_are_you_sure_you_want_to_download')} </Text>
          <View style={{flexDirection: 'row', marginTop: 10, alignItems: 'flex-end', justifyContent: 'flex-end'}}>
            <View style={{marginRight: 10}}>
              <Button color='#CCD1D1' title={I18n.t('cancel')} onPress={ () => this._onCloseModal() }/>
            </View>
            <Button title={I18n.t('yes')} onPress={ () => this._startDownload(story) } />
          </View>
        </View>
      </ModalDialog>
    )
  }

  _renderBtnDownload(story) {
    return (
      <View style={{marginTop: 24}}>
        { ( !this.props.storyDownloaded && !this.state.showReadNow ) &&
          <View>
            <TouchableOpacity
              onPress={()=> this._downloadStory(story)}
              style={storyStyle.btnDownload}>

              <Icon name="cloud-download" color='#fff' size={24} />
              <Text style={storyStyle.btnLabel}>{I18n.t('download')}</Text>
            </TouchableOpacity>
            {this._renderDownloadDialog(story)}
          </View>
        }

        { this.state.showProgress &&
          <Progress.Pie progress={this.state.progress} color='#E4145C' style={{marginTop: 10}}/>
        }
      </View>
    )
  }

  _openLink(url) {
    Linking.openURL(url);
  }

  _renderAcknowledgementOrSourceLink(story) {
    if (!story.source_link) {
      return (null);
    }

    let regex = /https?:\/\//g;
    let isLink = !!story.source_link.match(regex);

    if (isLink) {
      return(
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Text>{I18n.t('source_link')}: </Text>
          <TouchableOpacity onPress={()=> this._openLink(story.source_link)} style={{flex: 1}}>
            <Text style={{color: '#1976d2'}} ellipsizeMode='tail' numberOfLines={1}>{story.source_link}</Text>
          </TouchableOpacity>
        </View>
      )
    }

    return (
      <Text>
        <Text>{I18n.t('acknowledgement')}: </Text>
        <Text style={{flex: 1, paddingRight: 8}}>{story.source_link}</Text>
      </Text>
    )
  }

  _renderShortInfo(story) {
    let tags = story.tags.map((tag, index) => {
      return (
        <Text key={index} style={storyStyle.tag}>{tag.title}</Text>
      )
    })

    let license = LICENSES.filter(license => license.value == story.license)[0];

    return (
      <View style={{flex: 1}}>
        <Text>{I18n.t('published_at')} { this._getFullDate(story.published_at || story.publishedAt)}</Text>
        <Text style={{fontSize: 16}}>{story.title}</Text>
        <Text>{I18n.t('author')}: {story.author}</Text>
        { this._renderAcknowledgementOrSourceLink(story) }

        { !!license &&
          <View style={storyStyle.tagsWrapper}>
            <Text>{I18n.t('license')}:</Text>
            <TouchableOpacity onPress={() => this._openLink(license.link)}>
              <Text style={[storyStyle.tag, storyStyle.licenseText]}>{license.display}</Text>
            </TouchableOpacity>
          </View>
        }
        <View style={storyStyle.tagsWrapper}>{tags}</View>
        { this._renderBtnDownload(story) }
      </View>
    )
  }

  _renderDescription(story) {
    return (
      <View style={{padding: 16}}>
        <Text style={styles.descriptionTitle}>{I18n.t('story_description')}</Text>

        <Text style={{marginTop: 24}}>
          {story.description}
        </Text>
      </View>
    )
  }

  _renderImage(story) {
    let HOST = this.props.isOnline ? environment.domain : `file://`;

    return (
      <View style={[storyStyle.imageWrapper, {paddingRight: 16}]}>
        <Image
          style={storyStyle.image}
          source={{uri: `${HOST}${story.image}`}}
        />
      </View>
    )
  }

  _renderBtnReadNow(story) {
    return (
      <View style={{alignItems: 'center', marginBottom: 20}}>
        <TouchableOpacity
          onPress={()=> {this.props.readNow(story)}}
          style={[storyStyle.btnDownload, storyStyle.btnReadNow]}>
          <Icon name="book" color='#fff' size={24} />
          <Text style={storyStyle.btnLabel}>{I18n.t('read_now')}</Text>
        </TouchableOpacity>
      </View>
    )
  }

  _renderModelContent = (story) => {
    return (
      <View style={{flex: 1, backgroundColor: '#fff3df'}}>
        <Toolbar
          leftElement="arrow-back"
          centerElement={
            <Text
              ellipsizeMode='tail'
              numberOfLines={1}
              style={[headerStyle.title, {marginRight: 16}]}
            >{story.title}</Text>
          }
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
    this.setState({ showReadNow: false, showProgress: false })
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
  descriptionTitle: {
    color: 'green',
    textDecorationLine: 'underline',
  },
  shortInfo: {
    flexDirection: 'row',
    padding: 16,
  },
});
