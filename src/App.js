import {ApolloProvider} from 'react-apollo';
import OneGraphApolloClient from 'onegraph-apollo-client';
import OneGraphAuth from 'onegraph-auth';
import Captions from './Captions';
import youtubeLogo from './youtubeLogo.svg';

import React, {Component} from 'react';
import './App.css';

const APP_ID = '80397fc4-412c-4c68-a103-5acc3d7a9287';

const VIDEO_IDS = [
  'UBGzsb2UkeY',
  'u1E0CbGeICo',
  'DNPVqK_woRQ',
  'PHabPhgRUuU',
  'U2NKoStGBvE',
  'VYpJ9pfugM8',
  't6CRZ-iG39g',
];

function randomVideoId() {
  return VIDEO_IDS[Math.floor(Math.random() * VIDEO_IDS.length)];
}

class App extends Component {
  state = {
    checkingAuth: true,
    isLoggedIn: null,
    videoInput: '',
    videoId: randomVideoId(),
  };

  constructor(props) {
    super(props);
    this._oneGraphAuth = new OneGraphAuth({
      appId: APP_ID,
    });
    this._oneGraphClient = new OneGraphApolloClient({
      oneGraphAuth: this._oneGraphAuth,
    });
  }
  _authWithYoutube = async () => {
    this.setState({checkingAuth: true});
    try {
      await this._oneGraphAuth.login('youtube');
      const isLoggedIn = await this._oneGraphAuth.isLoggedIn('youtube');
      this.setState({isLoggedIn: isLoggedIn, checkingAuth: false});
    } catch(e) {
      this.setState({isLoggedIn: false, checkingAuth: false});
    }
  };
  componentDidMount() {
    this._oneGraphAuth.isLoggedIn('youtube').then(isLoggedIn => {
      this.setState({isLoggedIn, checkingAuth: false});
    });
  }
  _handleVideoInputChange = event => {
    this.setState({videoInput: event.target.value});
  };
  _handleKeyPress = event => {
    if (event.key === 'Enter') {
      this.setState({videoId: this.state.videoInput});
    }
  };
  _tryVideo = () => {
    const videoId = randomVideoId();
    this.setState({videoId, videoInput: videoId});
  };
  render() {
    if (this.state.checkingAuth) {
      return null;
    }
    if (!this.state.isLoggedIn) {
      return (
        <div className="App">
          <button
            className="youtube-signin-button"
            onClick={this._authWithYoutube}>
            Login with YouTube
            <img alt="youtube logo" src={youtubeLogo} />
          </button>
        </div>
      );
    }
    return (
      <ApolloProvider client={this._oneGraphClient}>
        <div className="App">
          <div>
            Enter a YouTube video id or{' '}
            <span
              style={{cursor: 'pointer', color: 'blue'}}
              onClick={this._tryVideo}>
              load a random video
            </span>
          </div>
          <span>
            <input
              style={{fontSize: 14, margin: '8px 0', padding: 4}}
              type="text"
              placeholder="e.g. YX40hbAHx3s"
              onChange={this._handleVideoInputChange}
              onKeyPress={this._handleKeyPress}
              value={this.state.videoInput}
            />
          </span>
          {this.state.videoId ? (
            <Captions videoId={this.state.videoId} />
          ) : null}
        </div>
      </ApolloProvider>
    );
  }
}

export default App;
