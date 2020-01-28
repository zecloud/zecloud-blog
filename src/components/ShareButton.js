import React from 'react'
import {
  FacebookShareButton,
  FacebookIcon,
  LinkedinShareButton,
  LinkedinIcon,
  TwitterShareButton,
  TwitterIcon,
  WhatsappShareButton,
  WhatsappIcon,
  RedditShareButton,
  RedditIcon
} from 'react-share'

export const ShareButtons = ({ twitterHandle, url, title, tags }) => (
  <div>
    <FacebookShareButton url={url}>
      <FacebookIcon round={true} />
    </FacebookShareButton>

    <TwitterShareButton url={url} title={title} via={twitterHandle} hashtags={tags}>
      <TwitterIcon round={true}  />
    </TwitterShareButton>

    <LinkedinShareButton url={url}>
      <LinkedinIcon round={true} />
    </LinkedinShareButton>

    <RedditShareButton url={url} title={title}>
      <RedditIcon round={true} />
    </RedditShareButton>

    <WhatsappShareButton url={url} title={title}>
      <WhatsappIcon round={true} />
    </WhatsappShareButton>
  </div>
)

export default ShareButtons