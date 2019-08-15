import React, { Component } from 'react';
import {
  View,
  TouchableOpacity,
} from 'react-native';

import Icon from 'react-native-vector-icons/MaterialIcons';

export default class AudioPlayer extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    let audio = this.props.audio;
    let iconColor = this.props.color ? this.props.color : '#fff';
    let size = this.props.size ? this.props.size : 28;
    return (
      <View>
        {!audio &&
          <Icon name='volume-off' color='#bbbfbc' size={28}/>
        }

        {!!audio &&
          <TouchableOpacity
            onPress={this.props.onClick}
            style={{paddingHorizontal: 8}}>
            { this.props.isPlaying &&
              <Icon name='pause' color={iconColor} size={size}/>
            }
            {
              !this.props.isPlaying &&
              <Icon name='play-arrow' color={iconColor} size={size}/>
            }
          </TouchableOpacity>
        }
      </View>
    )
  }
}
