import {gql} from 'apollo-boost';
import {Query} from 'react-apollo';
import React, {Component} from 'react';

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

const Timestamp = ({videoId, timestampText}) => {
  const [start] = timestampText.split(',');
  const [startHour, startMinute, startSecond] = start
    .split(':')
    .map(s => parseInt(s, 10));
  return (
    <span>
      <a
        target="_blank"
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

  render() {
    return (
      <Query query={GET_VIDEO} variables={{videoId: this.props.videoId}}>
        {({loading, error, data}) => {
          if (loading) return <div>Loading video...</div>;
          if (error)
            return <div>Uh oh, something went wrong: {error.message}</div>;
          const caption = data.youTube.video.captions.items.find(
            caption =>
              caption.snippet.status === 'serving' &&
              caption.snippet.language === 'en',
          );
          const re = new RegExp(this.state.filterString, 'im');
          const captionLines = caption.body
            .split('\n\n')
            .map(line => line.split('\n'))
            .filter(line => (line[1] || '').match(re));

          return (
            <div>
              <h3>{data.youTube.video.snippet.title}</h3>
              <span>
                Filter{' '}
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
