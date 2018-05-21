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

class Captions extends Component {
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
          const captionLines = caption.body
            .split('\n\n')
            .map(line => line.split('\n'));

          return (
            <div>
              <h3>{data.youTube.video.snippet.title}</h3>
              <table>
                <thead>
                  <tr>
                    <th style={{textAlign: 'right', padding: 4}}>Timestamps</th>
                    <th style={{textAlign: 'left', padding: 4}}>Text</th>
                  </tr>
                </thead>
                <tbody>
                  {captionLines.map(([timestamp, text]) => (
                    <tr>
                      <td style={{textAlign: 'right', padding: 4}}>
                        {timestamp}
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
