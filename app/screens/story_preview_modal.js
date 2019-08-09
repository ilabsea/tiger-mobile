import React, {Component} from 'react';
import {
  Text,
  View,
  ScrollView,
  StyleSheet,
  Image,
  Modal,
  Dimensions,
  ImageBackground,
  TouchableOpacity,
  Slider,
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import NetInfo from "@react-native-community/netinfo";
import ModalDialog from "react-native-modal";
import Sound from 'react-native-sound';
import RNFS from 'react-native-fs';

import { IndicatorViewPager } from 'rn-viewpager';
import { Toolbar, Icon } from 'react-native-material-ui';
import I18n from '../i18n/i18n';
import uuidv4 from '../utils/uuidv4';
import { TEXT_SIZE } from '../utils/variable';
import headerStyle from '../assets/style_sheets/header';
import realm from '../schema';
import Button from '../components/button';
import uploadService from '../services/upload.service';

const win = Dimensions.get('window');

export default class StoryPreviewModal extends Component {
  dataSource = [];
  questions = [];
  answers = [];
  totalSlides = 0;
  sound = null;
  story=null;

  constructor(props){
    super(props);

    this.state = { questions: [], isPlaying: false, currentIndex: 0, isStartingQuiz: false };
  }

  _slideTo(linkScene) {
    if (!linkScene) {
      this.setState({ currentIndex: 0, isStartingQuiz: true });
      this.stopPlaying();
      return this.refs.mySlider.setPage(this.dataSource.length);
    }
    let index = this.dataSource.findIndex(scene => scene.id == linkScene.id);
    this.setState({ currentIndex: index });
    this.refs.mySlider.setPage(index);
    this.stopPlaying();
  }

  _setAnswer(index, choice) {
    this.questions[index]['user_choice'] = choice;
    this.answers[index] = this.questions[index];

    this.setState({questions: this.answers});
  }

  _slideQuizTo(index, choice) {
    let next = this.dataSource.length + index;
    this.setState({ currentIndex: index });
    this._setAnswer(index-1, choice);
    this.refs.mySlider.setPage(next);
    this.stopPlaying();
  }

  _isCorrect(id, choices) {
    let arr = this._answers(choices).filter(obj => obj.id == id);
    return !!arr.length;
  }

  _getAnswers(choices) {
    let arr = this._answers(choices).map(choice => choice.label);
    return arr.join(' / ');
  }

  _answers(choices) {
    return choices.filter(obj => !!obj.answered);
  }

  _saveStoryResponse(action, slideIndex) {
    this.storyRead = realm.objects('StoryRead').filtered(`storyId=${action.storyId} AND finishedAt=NULL`).sorted('createdAt', true)[0];
    realm.write(()=> {
      realm.create('StoryResponse', {
        uuid: uuidv4(),
        sceneId: action.sceneId,
        sceneActionId: action.id,
        storyId: action.storyId,
        storyReadUuid: this.storyRead.uuid,
      })

      if (action.linkScene.isEnd || slideIndex == this.dataSource.length - 2) {
        this.storyRead.finishedAt = new Date;
      }
    })
  }

  _saveQuizResponse(choice, slideIndex) {
    realm.write(()=> {
      realm.create('QuizResponse', {
        uuid: uuidv4(),
        questionId: choice.questionId,
        choiceId: choice.id,
        storyId: choice.storyId,
        storyReadUuid: this.storyRead.uuid,
      })

      if (slideIndex == this.questions.length - 1) {
        this.storyRead.isQuizFinished = true;
      }
    })
  }

  _renderActionButtons(scene, slideIndex) {
    let textStyle = { fontSize: this.state.textSize || this.props.textSize };

    if ((scene.isEnd || !scene.sceneActions.length) && !!this.questions.length) {
      return (
        <View style={{padding: 16}}>
          <Button
            onPress={()=> this._slideTo()}
            title={ I18n.t('go_to_quiz') }
            textStyle={textStyle}
          ></Button>
        </View>
      )
    }

    let buttons = (scene.sceneActions).map((action, i) => {
      return(
        <Button
          key={i}
          onPress={()=> {
            this._slideTo(action.linkScene);
            this._saveStoryResponse(action, slideIndex);
          }}
          title={action.name}
          textStyle={textStyle}
        ></Button>
      )
    })

    return (<View style={{padding: 16}}>{buttons}</View>)
  }

  _renderImage(image) {
    return (
      <View style={[headerStyle.centerChildWrapper, {height: 300}]}>
        <Image style={styles.image} source={image} />
      </View>
    )
  }

  _renderDescription(scene, index) {
    let textStyle = { fontSize: this.state.textSize || this.props.textSize };

    return (
      <Text style={[styles.textShadow, textStyle, {padding: 16, flex: 1}]}>{scene.description}</Text>
    )
  }

  _renderScenes() {
    return(
      (this.dataSource).map((scene, index) => {
        let imageUri = { uri: `file://${scene.image}` };
        let bgStyle = !!scene.image ? {} : { backgroundColor: '#fff3df' };

        return (
          <View key={index} style={bgStyle}>
            { scene.visibleName && <Text style={[styles.title]}>{scene.name}</Text> }

            { !!scene.image && scene.imageAsBackground &&
              <ImageBackground source={ imageUri } style={{flex: 1}} >
                <ScrollView contentContainerStyle={{flexGrow: 1}}>
                  { this._renderDescription(scene, index) }
                  { this._renderActionButtons(scene, index) }
                </ScrollView>
              </ImageBackground>
            }

            { (!scene.imageAsBackground || !scene.image) &&
              <ScrollView contentContainerStyle={{flexGrow: 1}}>
                { !!scene.image && this._renderImage(imageUri) }
                { this._renderDescription(scene, index) }
                { this._renderActionButtons(scene, index) }
              </ScrollView>
            }
          </View>
        )
      })
    )
  }

  _renderChoices(question, slideIndex) {
    let textStyle = { fontSize: this.state.textSize || this.props.textSize };

    let buttons = (question.choices || []).map((choice, i) => (
      <Button
        key={i}
        onPress={()=> {
          this._slideQuizTo(slideIndex+1, choice);
          this._saveQuizResponse(choice, slideIndex);
        }}
        title={choice.label}
        textStyle={textStyle}
      ></Button>
    ))

    return (<View style={{padding: 16}}>{buttons}</View>)
  }

  _renderQuizzes() {
    let textStyle = { fontSize: this.state.textSize || this.props.textSize };

    return(
      this.questions.map((question, index) => {
        return (
          <View key={index}>
            <Text style={styles.title}>{ I18n.t('quiz')}: {I18n.t('question')} {index + 1}/{this.questions.length }</Text>

            <ScrollView style={{flex: 1, padding: 16}}>
              <Text style={[styles.textShadow, textStyle]}>{ question.label }</Text>
            </ScrollView>

            { this._renderChoices(question, index) }
          </View>
        )
      })
    )
  }

  _showMessage(question) {
    this.setState({message: question.message, isMessageVisible: true});
  }

  _renderResultLabel(question, textStyle) {
    if (this._isCorrect(question.user_choice.id, question.choices)) {
      return (
        <Text style={[styles.textShadow, textStyle, {color: 'green'}]}>[{this._getAnswers(question.choices)}]</Text>
      )
    }

    return (
      <View>
        <Text style={[styles.textShadow, textStyle, styles.wrong]}>{question.user_choice.label}</Text>
        <Text style={[styles.textShadow, textStyle, {color: 'green'}]}>[{this._getAnswers(question.choices)}]</Text>
      </View>
    )
  }

  _renderResultButton(question, textStyle) {
    if (!!question.message) {
      return (
        <TouchableOpacity onPress={() => this._showMessage(question)}>
          { this._renderResultLabel(question, textStyle) }
        </TouchableOpacity>
      )
    }

    return (<View>{ this._renderResultLabel(question, textStyle) }</View>)
  }

  _renderQuizResult() {
    let textStyle = { fontSize: this.state.textSize || this.props.textSize };

    let doms = this.state.questions.map((question, index) => {
      return (
        <View key={index} style={{marginBottom: 16}}>
          <Text style={[styles.textShadow, textStyle]}>{index+1}) {question.label}</Text>

          <View style={{flexDirection: 'row'}}>
            <Text style={[styles.textShadow, textStyle, {fontWeight: '500'}]}>{I18n.t('answer')}: </Text>

            <View style={{flex: 1}}>
              {this._renderResultButton(question, textStyle)}
            </View>
          </View>
        </View>
      )
    })

    return (
      <View>
        <Text style={[styles.title]}>{ I18n.t('result')}</Text>

        <ScrollView style={{flex: 1, padding: 16}}>
          {doms}
        </ScrollView>

        <View style={{padding: 16}}>
          <Button
            title={I18n.t('done')}
            onPress={() => this._closeModal()}
            textStyle={textStyle}
          ></Button>
        </View>
      </View>
    )
  }

  _renderFormatSizeDialog() {
    return (
      <ModalDialog
        isVisible={this.state.isDialogVisible}
        onBackdropPress={() => this.setState({isDialogVisible: false})}
      >
        <View style={{ padding: 20, backgroundColor: '#fff'}}>
          <Text>{I18n.t('text_size')}</Text>
          <View style={{height: 30}}>
            <Text style={{fontSize: this.state.textSize, textAlign: 'center' }}>{I18n.t('lorem_ipsum')}</Text>
          </View>
          { this._renderSlider() }
        </View>
      </ModalDialog>
    )
  }

  _renderMessageDialog() {
    return (
      <ModalDialog
        isVisible={this.state.isMessageVisible}
        onBackdropPress={() => this.setState({isMessageVisible: false})}
      >
        <View style={{ padding: 20, backgroundColor: '#fff'}}>
          <Text style={{fontSize: 16}}>{I18n.t('educational_message')}</Text>
          <ScrollView>
            <Text>{this.state.message}</Text>
          </ScrollView>
        </View>
      </ModalDialog>
    )
  }

  _onSaveSize = () => {
    let size = this.state.textSize || this.props.textSize;

    AsyncStorage.setItem(TEXT_SIZE, String(size), () => {
      this.setState({ isDialogVisible: false });
    });
  }

  _renderSlider() {
    return (
      <View style={styles.container}>
        <View style={styles.letterAWrapper} >
          <Text style={[styles.textSize, {fontSize: 14}, this._activeKlass(14)]}>A</Text>
          <Text style={[styles.textSize, {fontSize: 18}, this._activeKlass(18)]}>A</Text>
          <Text style={[styles.textSize, {fontSize: 22}, this._activeKlass(22)]}>A</Text>
          <Text style={[styles.textSize, {fontSize: 26}, this._activeKlass(26)]}>A</Text>
        </View>

        <Slider
          step={4}
          maximumValue={26}
          minimumValue={14}
          onValueChange={(textSize) => this.setState({textSize: textSize})}
          value={this.state.textSize || this.props.textSize}
        />
      </View>
    )
  }

  async stopPlaying() {
    if(this.sound){
      this.sound.stop();
      this.setState({isPlaying: false});
    }
  }

  async play() {
    this.setState({isPlaying: true});
    let currentPage = this.state.isStartingQuiz ?
                      this.story.questions[this.state.currentIndex]
                      : this.story.scenes[this.state.currentIndex];
    if(currentPage){
      setTimeout(() => {
        this.sound = new Sound(currentPage.audio , '', (error) => {
          if (error) {
            Alert.alert(
              this.story.title,
              I18n.t('audio_is_missing'),
              [
                { text: I18n.t('yes'), style: 'cancel' }
              ],
              { cancelable: true }
            )
          }
        });

        setTimeout(() => {
          this.sound.play((success) => {
            if (success) {
              this.setState({isPlaying: false});
            } else {
              this.sound.reset();
            }
          });
        }, 100);
      }, 100);
    }
  }

  _handleAudioPlay() {
    if (this.state.isPlaying) {
      return this.stopPlaying();
    }
    this.play();
  }

  _renderModalContent = () => {
    if(!this.story || !this.story.title) {
      return null;
    }
    let currentPageObj = this.state.isStartingQuiz ?
                          this.story.questions[this.state.currentIndex]:
                          this.story.scenes[this.state.currentIndex];
    let audio = currentPageObj ? currentPageObj.audio : '';
    return (
      <View style={{flex: 1, backgroundColor: '#fff3df'}}>
        <Toolbar
          leftElement="arrow-back"
          centerElement={
            <Text
              ellipsizeMode='tail'
              numberOfLines={1}
              style={headerStyle.title}>
              {this.story.title}
            </Text>
          }
          rightElement={
            <View style={{flexDirection: 'row'}}>
              {!audio &&
                <Icon name='volume-off' color='#bbbfbc' size={28}/>
              }

              {!!audio &&
                <TouchableOpacity
                  onPress={() => this._handleAudioPlay()}
                  style={{paddingHorizontal: 8}}>
                  { this.state.isPlaying &&
                    <Icon name='pause' color='#fff' size={28}/>
                  }
                  {
                    !this.state.isPlaying &&
                    <Icon name='play-arrow' color='#fff' size={28}/>
                  }
                </TouchableOpacity>
              }

              <TouchableOpacity onPress={()=> this.setState({ isDialogVisible: true })} style={{paddingHorizontal: 8}}>
                <Icon name='format-size' color='#fff' size={24} />
              </TouchableOpacity>
            </View>
          }
          onLeftElementPress={() => this._closeModal()}
          onRightElementPress={()=> this.setState({ isDialogVisible: true }) } />

        <View style={{flex: 1}}>
          <IndicatorViewPager
            style={{flex: 1}}
            ref="mySlider"
            horizontalScroll={false}>

            { this._renderScenes() }
            { this._renderQuizzes() }
            { this._renderQuizResult() }
          </IndicatorViewPager>

          { this._renderFormatSizeDialog() }
          { this._renderMessageDialog() }
        </View>

      </View>
    )
  }

  _closeModal() {
    this.stopPlaying();
    this.setState({questions: [], currentIndex: 0});
    this._handleUpload();
    this.props.onRequestClose();
  }

  _handleUpload() {
    if (!this.storyRead || !this.storyRead.isValid() || !this.storyRead.finishedAt) {
      return;
    }

    NetInfo.isConnected.fetch().then(isConnected => {
      if (isConnected) {
        uploadService.upload();
      }
    });
  }

  _activeKlass = (value) => {
    let size = this.state.textSize || this.props.textSize;

    return value == size ? styles.activeSize : {} ;
  }

  render() {
    const { modalVisible, onRequestClose, ...props } = this.props;
    this.story = this.props.story;
    if(this.story) {
      this.dataSource = this.story.scenes || [];
      this.questions = (this.story.questions || []).slice();
      this.totalSlides = this.dataSource.length + this.questions.length;
    }

    return (
      <Modal
        {...props}
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => this._closeModal()}>

        { this._renderModalContent() }
      </Modal>
    )
  }
}

const styles = StyleSheet.create({
  image: {
    flex: 1,
    alignSelf: 'stretch',
    width: win.width,
    height: win.height,
  },
  textShadow: {
    textShadowColor: '#fff',
    textShadowOffset: {width: -2, height: -1},
    textShadowRadius: 1,
    color: '#000',
    fontSize: 16
  },
  title: {
    textAlign: 'center',
    fontSize: 20,
    lineHeight: 40,
  },
  textSize: {
    color: '#ddd',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  activeSize: {
    color: '#111',
  },
  btnDone: {
    marginTop: 20,
    paddingVertical: 16,
    borderRadius: 10,
    backgroundColor: '#E4145C',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
  },
  letterAWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 16
  },
  wrong: {
    color: 'red',
    textDecorationLine: 'line-through'
  }
});
