import React, {Component} from 'react';
import {
  Text,
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  Dimensions,
} from 'react-native';

import { IndicatorViewPager } from 'rn-viewpager';
import { Toolbar, Icon } from 'react-native-material-ui';
import I18n from '../i18n/i18n';
import headerStyle from '../assets/style_sheets/header';
import realm from '../schema';
import Button from '../components/button';

const win = Dimensions.get('window');

export default class StoryPreviewModal extends Component {
  dataSource = [];
  questions = [];
  answers = [];
  totalSlides = 0;
  state = { questions: [] };

  _slideTo(linkScene) {
    if (!linkScene) {
      return this.refs.mySlider.setPage(this.dataSource.length);
    }

    let index = this.dataSource.findIndex(scene => scene.id == linkScene.id);
    this.refs.mySlider.setPage(index);
  }

  _setAnswer(index, choice) {
    this.questions[index]['user_choice'] = choice;
    this.answers[index] = this.questions[index];

    this.setState({questions: this.answers});
  }

  _slideQuizTo(index, choice) {
    let next = this.dataSource.length + index;

    this._setAnswer(index-1, choice);
    this.refs.mySlider.setPage(next);
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

  _renderActionButtons(scene) {
    if (!scene.sceneActions.length && !!this.questions.length) {
      return (
        <Button
          onPress={()=> this._slideTo()}
          title={ I18n.t('go_to_quiz') }
        ></Button>
      )
    }

    return (
      (scene.sceneActions).map((action, i) => {
        return(
          <Button
            key={i}
            onPress={()=> this._slideTo(action.linkScene)}
            title={action.name}
          ></Button>
        )
      })
    )
  }

  _renderImage(scene) {
    let image = !!scene.image ? { uri: `file://${scene.image}` } : require('../assets/images/scenes/default.jpg');

    return (
      <View style={styles.centerChildWrapper}>
        <Image style={styles.image} resizeMode={'contain'} source={image} />
      </View>
    )
  }

  _renderScenes() {
    return(
      (this.dataSource).map((scene, index) => {
        let style = (!scene.image || scene.imageAsBackground) ? styles.popLayer : {}

        return (
          <View key={index}>
            { scene.visibleName && <Text style={[styles.title]}>{scene.name}</Text> }

            { this._renderImage(scene) }

            <View style={style}>
              <Text style={[styles.textShadow, {padding: 16}]}>{scene.description}</Text>

              <View style={{padding: 16}}>
                { this._renderActionButtons(scene) }
              </View>
            </View>

          </View>
        )
      })
    )
  }

  _renderChoices(question, index) {
    return(
      (question.choices || []).map((choice, i) => (
        <Button
          key={i}
          onPress={()=> this._slideQuizTo(index+1, choice)}
          title={choice.label}
        ></Button>
      ))
    )
  }

  _renderQuizzes() {
    return(
      this.questions.map((question, index) => {
        return (
          <View key={index}>
            <Text style={[styles.title]}>{ I18n.t('quiz')}: {I18n.t('question')} {index + 1}/{this.questions.length }</Text>

            <View style={[styles.centerChildWrapper, {padding: 16}]}>
              <Text>{ question.label }</Text>
            </View>

            <View style={{padding: 16}}>
              { this._renderChoices(question, index) }
            </View>
          </View>
        )
      })
    )
  }

  _renderQuizResult() {
    let doms = this.state.questions.map((question, index) => {
      return (
        <View key={index} style={{marginBottom: 10}}>
          <Text>{index+1}) {question.label}</Text>
          <Text>
            <Text style={{fontWeight: '500'}}>Answer: </Text>

            { !this._isCorrect(question.user_choice.id, question.choices) &&
              <Text style={{color: 'red', textDecorationLine: 'line-through'}}>{question.user_choice.label} / </Text>
            }

            <Text style={{color: 'green'}}>[{this._getAnswers(question.choices)}]</Text>
          </Text>
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
          ></Button>
        </View>
      </View>
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

        <View style={{flex: 1}}>
          <IndicatorViewPager
            style={{flex: 1}}
            ref="mySlider"
            horizontalScroll={false}
          >
            { this._renderScenes() }
            { this._renderQuizzes() }
            { this._renderQuizResult() }
          </IndicatorViewPager>
        </View>
      </View>
    )
  }

  _closeModal() {
    this.props.onRequestClose();
  }

  render() {
    const { modalVisible, onRequestClose, ...props } = this.props;

    let story = Object.assign({}, this.props.story);
    this.dataSource = story.scenes || [];
    // this.dataSource = [];
    this.questions = (story.questions || []).slice();
    this.totalSlides = this.dataSource.length + this.questions.length;

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
  popLayer: {
    position: 'absolute',
    bottom: 0
  },
  image: {
    flex: 1,
    alignSelf: 'stretch',
    width: win.width,
    height: win.height,
  },
  textShadow: {
    textShadowColor: '#fff',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10
  },
  title: {
    textAlign: 'center',
    fontSize: 20,
    lineHeight: 24,
    padding: 16
  },
  centerChildWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
});
