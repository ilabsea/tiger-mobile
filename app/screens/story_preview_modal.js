import React, {Component} from 'react';
import {
  Text,
  View,
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
  totalSlides = 0;

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
        return (
          <View key={index}>
            { scene.visibleName && <Text style={[styles.title]}>{scene.name}</Text> }

            { this._renderImage(scene) }

            <View style={[scene.imageAsBackground ? styles.popLayer : {}]}>
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

  _slideTo(linkScene) {
    if (!linkScene) {
      return this.refs.mySlider.setPage(this.dataSource.length);
    }

    let index = this.dataSource.findIndex(scene => scene.id == linkScene.id);
    this.refs.mySlider.setPage(index);
  }

  _slideQuizTo(index, choice) {
    let next = this.dataSource.length + index;

    // this._setAnswer(index-1, choice);

    if ( next == this.totalSlides) {
      return alert('done');
    }

    this.refs.mySlider.setPage(next);
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

  _renderSlides() {
    return (
      <View style={{flex: 1}}>
        <IndicatorViewPager
          style={{flex: 1}}
          ref="mySlider"
          horizontalScroll={false}
        >
          { this._renderScenes() }
          { this._renderQuizzes() }
        </IndicatorViewPager>
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

        { this._renderSlides() }
      </View>
    )
  }

  _closeModal() {
    this.props.onRequestClose();
  }

  render() {
    const { story, modalVisible, onRequestClose, ...props } = this.props;

    this.dataSource = story.scenes || [];
    this.questions = story.questions || [];
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
