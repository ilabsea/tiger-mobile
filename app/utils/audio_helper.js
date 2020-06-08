import Sound from 'react-native-sound';
import { Alert } from 'react-native';
import I18n from '../i18n/i18n';

const AudioHelper = {
  sound: null,
  setSound: function(sound){
    this.sound = new Sound(sound , '', (error) => {
      if (error) {
        Alert.alert(
          '',
          I18n.t('audio_is_missing'),
          [
            { text: I18n.t('yes'), style: 'cancel' }
          ],
          { cancelable: true }
        )
      }
    });
  },
  getSound: function(){
    return this.sound;
  },
  stopPlaying: function() {
    if(this.sound){
      this.sound.stop();
      this.sound = null;
    }
  },
  handleAudioPlay: function(audioPath, callback) {
    if(audioPath) {
      setTimeout(() => {
        this.setSound(audioPath);

        setTimeout(() => {
          this._onPlay(callback);
        }, 100);
      }, 100);
    }
  },
  _onPlay: function(callback){
    this.sound.play((success) => {
      if (success) {
        callback(false);
      } else {
        this.sound.reset();
      }
    });
  },
  _toggleAudioPlay: function(audio, isPlaying, callback){
    let sound = this.getSound();

    if (isPlaying && sound) {
      callback(false);
      sound.pause();
      return null;
    }
    if(sound){
      callback(true);
      AudioHelper._onPlay((isPlayingParam) => {
        callback(isPlayingParam);
      });
    }else{
      callback(true);
      AudioHelper.handleAudioPlay(audio, (isPlayingParam) => {
        callback(isPlayingParam);
      });
    }
  }
}

export default AudioHelper;
