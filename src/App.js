import {ApolloProvider} from 'react-apollo';
import {ApolloClient} from 'apollo-client';
import {HttpLink} from 'apollo-link-http';
import {InMemoryCache} from 'apollo-cache-inmemory';
import OneGraphAuth from 'onegraph-auth';
import Captions from './Captions';

import React, {Component} from 'react';
import './App.css';

const APP_ID = '80397fc4-412c-4c68-a103-5acc3d7a9287';

const client = new ApolloClient({
  link: new HttpLink({
    uri: 'https://serve.onegraph.com/dynamic?app_id=' + APP_ID,
    headers: {'Content-Type': 'application/json'},
    credentials: 'include',
  }),
  cache: new InMemoryCache(),
});

const VIDEO_IDS = [
  'UBGzsb2UkeY',
  'u1E0CbGeICo',
  'DNPVqK_woRQ',
  'PHabPhgRUuU',
  'U2NKoStGBvE',
  'VYpJ9pfugM8',
  't6CRZ-iG39g',
];

class App extends Component {
  state = {
    checkingAuth: true,
    isLoggedIn: null,
    videoInput: '',
    videoId: null, // videoId for testing 'YX40hbAHx3s'
  };
  _oneGraphAuth = new OneGraphAuth({
    appId: APP_ID,
    service: 'google',
  });
  _authWithGoogle = async () => {
    this.setState({checkingAuth: true});
    await this._oneGraphAuth.login();
    const isLoggedIn = await this._oneGraphAuth.isLoggedIn();
    this.setState({isLoggedIn: isLoggedIn, checkingAuth: false});
  };
  componentDidMount() {
    this._oneGraphAuth.isLoggedIn().then(isLoggedIn => {
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
    const videoId = VIDEO_IDS[Math.floor(Math.random() * VIDEO_IDS.length)];
    this.setState({videoId, videoInput: videoId});
  };
  render() {
    if (this.state.checkingAuth) {
      return <div className="App">Checking if logged in...</div>;
    }
    if (!this.state.isLoggedIn) {
      return (
        <div className="App">
          <button
            style={{fontSize: 14, cursor: 'pointer'}}
            onClick={this._authWithGoogle}>
            Login with Google
          </button>
        </div>
      );
    }
    return (
      <ApolloProvider client={client}>
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
