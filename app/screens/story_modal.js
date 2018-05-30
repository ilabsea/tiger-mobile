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
import I18n from '../i18n/i18n';
import headerStyle from '../assets/style_sheets/header';
import realm from '../schema';
import sceneService from '../services/scene.service';
import RNFS from 'react-native-fs';

let jobId = -1;
let images = [];

export default class StoryModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      output: 'Doc folder: ' + RNFS.DocumentDirectoryPath,
      imagePath: {
        uri: ''
      }
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
      author: story.user.email.split('@')[0],
      publishedAt: story.published_at,
      tags: story.tags.map(tag => tag.title)
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
        }
      );
    })
  }

  _downloadFiles(story, scenes) {
    let scenesList = scenes.filter(s => !!s.image);
    images = [{type: 'Story', id: story.id, url: story.image}];

    scenesList.map((s)=>{
      images.push({type: 'Scene', id: s.id, url: s.image})
    })

    this._downloadFile(0);
  }

  _downloadFile(index) {
    // console.log('===============images', images);
    let image = images[index];
    let progress = data => {};
    let begin = res => {};
    let progressDivider = 1;
    let background = false;

    let fileName = image.url.split('/').slice(-1)[0];
    let downloadDest = `${RNFS.DocumentDirectoryPath}/${fileName}`;
    let ret = RNFS.downloadFile({ fromUrl: `http://192.168.1.107:3000${image.url}`, toFile: downloadDest, begin, progress, background, progressDivider });
    jobId = ret.jobId;

    ret.promise.then(res => {
      realm.write(() => {
        let obj = realm.objects(image.type).filtered(`id=${image.id}`)[0];
        obj.image = downloadDest;

        console.log('================obj with image', obj);
      })

      jobId = -1;

      if (index + 1 < images.length) {
        this._downloadFile(index + 1);
      }
    }).catch(err => {
      jobId = -1;

      if (index + 1 < images.length) {
        this._downloadFile(index + 1);
      }
    });
  }


  _importSceneActions(scenes) {
    let allActions = realm.objects('SceneAction');
    realm.delete(allActions);

    scenes.map((scene) => {
      let objScene = realm.objects('Scene').filtered(`id=${scene.id}`)[0];
      let actionList = objScene.sceneActions;

      scene.scene_actions.map((action) => {
        if (!!action.link_scene.id) {
          let linkScene = realm.objects('Scene').filtered(`id=${action.link_scene.id}`)[0];

          actionList.push(
            {
              id: action.id,
              name: action.name,
              displayOrder: action.display_order,
              sceneId: scene.id,
              linkScene: linkScene
            }
          )
        }
      })
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

          // let objStory = realm.objects('Story').filtered(`id=${story.id}`);
          // console.log('================test', objStory);
        });
      })
  }

  downloadFileTest(background, url) {
    if (jobId !== -1) {
      this.setState({ output: 'A download is already in progress' });
    }

    const progress = data => {
      const percentage = ((100 * data.bytesWritten) / data.contentLength) | 0;
      const text = `Progress ${percentage}%`;
      this.setState({ output: text });
    };

    const begin = res => {
      this.setState({ output: 'Download has begun' });
    };

    const progressDivider = 1;

    this.setState({ imagePath: { uri: '' } });

    const downloadDest = `${RNFS.DocumentDirectoryPath}/${((Math.random() * 1000) | 0)}.jpg`;

    const ret = RNFS.downloadFile({ fromUrl: url, toFile: downloadDest, begin, progress, background, progressDivider });

    jobId = ret.jobId;

    ret.promise.then(res => {
      this.setState({ output: JSON.stringify(res) });
      this.setState({ imagePath: { uri: 'file://' + downloadDest } });

      jobId = -1;
    }).catch(err => {
      this.showError(err)

      jobId = -1;
    });
  }

  _renderBtnDownload(story) {
    return (
      <TouchableOpacity
        onPress={()=> this._downloadStory(story)}
        style={styles.btnDownload}
      >
        <Icon name="cloud-download" color='#fff' size={24} />
        <Text style={styles.btnDownloadText}>{I18n.t('add_to_library')}</Text>
      </TouchableOpacity>
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

  _renderModelContent = (story) => {
    return (
      <View style={{flex: 1}}>
        <Toolbar
          leftElement="arrow-back"
          centerElement={<Text style={headerStyle.title}>{story.title}</Text>}
          onLeftElementPress={this.props.onRequestClose}
        />

        <ScrollView style={{flex: 1}}>
          <View style={styles.shortInfo}>
            { this._renderImage(story) }
            { this._renderShortInfo(story) }
          </View>

          { this._renderDescription(story) }

          { false && this.renderDownloadImageForTest() }
        </ScrollView>
      </View>
    )
  }

  renderDownloadImageForTest() {
    const downloadUrl = "http://192.168.1.107:3000/uploads/story/image/16/30741642_226130137942625_5053281481921658880_o.jpg";

    return(
      <View>
        <View style={styles.panes}>
          <View style={styles.leftPane}>
            <TouchableHighlight onPress={() => {this.downloadFileTest(true, downloadUrl)} }>
              <View style={styles.button}>
                <Text style={styles.text}>Download File</Text>
              </View>
            </TouchableHighlight>
          </View>
        </View>

        <View>
          <Text style={styles.text}>{this.state.output}</Text>

          { !!this.state.imagePath.uri &&
            <View>
              <Image style={styles.image} source={this.state.imagePath}></Image>
              <Text>{this.state.imagePath.uri}</Text>
            </View>
          }

        </View>
      </View>
    )
  }

  render() {
    const { story, modalVisible, onRequestClose, ...props } = this.props;

    return (
      <Modal
        {...props}
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={onRequestClose}>

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
    marginTop: 24,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#E4145C',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDownloadText: {
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
