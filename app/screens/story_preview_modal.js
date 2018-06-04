import React, {Component} from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  ScrollView,
  Dimensions,
} from 'react-native';

import {PagerTabIndicator, IndicatorViewPager, PagerTitleIndicator, PagerDotIndicator} from 'rn-viewpager';
import { Toolbar, Icon, Button} from 'react-native-material-ui';
import I18n from '../i18n/i18n';
import headerStyle from '../assets/style_sheets/header';
import realm from '../schema';

const win = Dimensions.get('window');

export default class StoryPreviewModal extends Component {
  constructor(props) {
    super(props);
  }

  _slideTo(linkScene) {
    if (!linkScene) {
      // carousel.slideTo(this.dataSource.length);
      return;
    }

    let dataSource = this.props.story.scenes || [];
    let index = dataSource.findIndex(scene => scene.id == linkScene.id);

    this.refs.mySlider.setPage(index);
  }

  _renderActionButtons(scene) {
    return (
      (scene.sceneActions || []).map((action, i) => {
        console.log('==============action', action)
        return (
          <Button
            key={i}
            raised
            accent
            onPress={()=> this._slideTo(action.linkScene)}
            text={action.name} />
        )
      })
    )
  }

  _renderImage(scene) {
    let image = require('../assets/images/scenes/default.jpg');

    if (!!scene.image) {
      image = {uri: `file://${scene.image}`};
    }

    return (
      <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
        <Image
          style={styles.image}
          resizeMode={'contain'}
          source={image}
        />
      </View>
    )
  }

  _renderSlides() {
    // let story = realm.objects('Story').filtered(`id=${this.props.story.id}`)[0];
    let scenes = this.props.story.scenes || [];
    let slides = scenes.map((scene, index) => {

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
    });

    return (
      <View style={{flex: 1}}>
        <IndicatorViewPager
          style={{flex: 1}}
          ref="mySlider"
          horizontalScroll={false}
        >
        { slides }
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
  }
});
