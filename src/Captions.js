import {gql} from 'apollo-boost';
import {Query} from 'react-apollo';
import React, {Component} from 'react';
import YouTubePlayer from 'react-player/lib/players/YouTube';

const GET_VIDEO = gql`
  query VideoWithCaptionsQuery($videoId: String!) {
    youTube {
      video(id: $videoId) {
        id
        snippet {
          title
        }
        captions {
          items {
            snippet {
              language
              status
            }
            body
          }
        }
      }
    }
  }
`;

function videoUrl(id, {hour, minute, second}) {
  return `https://youtube.com/watch?v=${id}&t=${hour}h${minute}m${second}s`;
}

const Timestamp = ({videoId, timestampText, seekTo}) => {
  const [start] = timestampText.split(',');
  const [startHour, startMinute, startSecond] = start
    .split(':')
    .map(s => parseInt(s, 10));
  return (
    <span>
      <a
        target="_blank"
        onClick={e => {
          e.preventDefault();
          const seconds = startHour * 60 * 60 + startMinute * 60 + startSecond;
          seekTo(seconds);
        }}
        href={videoUrl(videoId, {
          hour: startHour,
          minute: startMinute,
          second: startSecond,
        })}>
        {start}
      </a>
    </span>
  );
};

class Captions extends Component {
  state = {
    filterString: '',
  };
  _handleFilterInput = event => {
    this.setState({filterString: event.target.value});
  };

  _seekTo = seconds => {
    if (this._player) {
      this._player.seekTo(seconds);
    }
  };

  render() {
    return (
      <Query query={GET_VIDEO} variables={{videoId: this.props.videoId}}>
        {({loading, error, data}) => {
          if (loading) return <div>Loading video...</div>;
          if (!data && error)
            return <div>Uh oh, something went wrong: {error.message}</div>;
          if (!data.youTube.video) {
            return <div>Could not find a video with that id.</div>;
          }
          const caption = data.youTube.video.captions.items.find(
            caption =>
              caption.snippet.status === 'serving' &&
              caption.snippet.language === 'en',
          );
          if (!caption || !caption.body) {
            return (
              <div>
                <YouTubePlayer
                  ref={ref => {
                    this._player = ref;
                  }}
                  url={`https://www.youtube.com/watch?v=${this.props.videoId}`}
                  controls
                />
                <h3>{data.youTube.video.snippet.title}</h3>
                       <div>Could not find captions for this video {'\uD83D\uDE15'}</div>
              </div>
            );
          }
          const re = new RegExp(this.state.filterString, 'im');
          const captionLines = caption.body
            .split('\n\n')
            .map(line => line.split('\n'))
            .filter(line => (line[1] || '').match(re));

          return (
            <div>
              <YouTubePlayer
                ref={ref => {
                  this._player = ref;
                }}
                url={`https://www.youtube.com/watch?v=${this.props.videoId}`}
                controls
              />
              <h3>{data.youTube.video.snippet.title}</h3>
              <span>
                Search{' '}
                <input
                  style={{fontSize: 14, margin: '8px 0', padding: 4}}
                  type="text"
                  value={this.state.filterString}
                  onChange={this._handleFilterInput}
                />
              </span>
              <table>
                <thead>
                  <tr>
                    <th style={{textAlign: 'right', padding: 4}}>Timestamp</th>
                    <th style={{textAlign: 'left', padding: 4}}>Text</th>
                  </tr>
                </thead>
                <tbody>
                  {captionLines.map(([timestamp, text]) => (
                    <tr>
                      <td style={{textAlign: 'right', padding: 4}}>
                        <Timestamp
                          videoId={this.props.videoId}
                          timestampText={timestamp}
                          seekTo={this._seekTo}
                        />
                      </td>
                      <td style={{textAlign: 'left', padding: 4}}>{text}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }}
      </Query>
    );
  }
}

export default Captions;
