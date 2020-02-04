import React from 'react'
import PropTypes from 'prop-types'
import { graphql } from 'gatsby'
import Helmet from 'react-helmet'
import url from 'url'
import config from '../utils/siteConfig'
import { Layout } from '../components/common'
import { MetaData } from '../components/common/meta'
import { Disqus, CommentCount } from 'gatsby-plugin-disqus'
import {ShareButtons } from '../components/ShareButton'
import Img from 'gatsby-image';
import { get } from 'lodash';
/**
* Single post view (/:slug)
*
* This file renders a single post and loads all the content.
*
*/
const Post = ({ data, location }) => {
    const post = data.ghostPost
    const postFeatureImage = get(
        post,
        `localFeatureImage.childImageSharp.fluid`,
        null
    );
    let disqusConfig = {
        ur:url.resolve(config.siteUrl, location.pathname),
        identifier: post.id,
        title: post.title,
      }
    return (
        <>
            <MetaData
                data={data}
                location={location}
                type="article"
            />
            <Helmet>
                <style type="text/css">{`${post.codeinjection_styles}`}</style>
            </Helmet>
            <Layout>
                <div className="container">
                    <article className="content">
                        { post.feature_image ?
                            <figure className="post-feature-image">
                                <Img  fluid={postFeatureImage} alt={ post.title } />
                            </figure> : null }
                            <div >
                        {/* <CommentCount config={disqusConfig} placeholder={'...'} /> */}
                       
                      <br/>
                       </div>
                        <section className="post-full-content">
                      
                            <h1 className="content-title">{post.title}</h1>
                          
                            {/* The main post content */ }
                            <section
                                className="content-body load-external-scripts"
                                dangerouslySetInnerHTML={{ __html: post.html }}
                            />
                        </section>
                        <ShareButtons twitterHandle="aymericw" url={url.resolve(config.siteUrl, location.pathname)} title={post.title} />
                        <Disqus config={disqusConfig} />
                    </article>
                    
                 
                    
                </div>
            </Layout>
        </>
    )
}

Post.propTypes = {
    data: PropTypes.shape({
        ghostPost: PropTypes.shape({
            codeinjection_styles: PropTypes.object,
            title: PropTypes.string.isRequired,
            html: PropTypes.string.isRequired,
            localFeatureImage: PropTypes.object,
        }).isRequired,
    }).isRequired,
    location: PropTypes.object.isRequired,
}

export default Post

export const postQuery = graphql`
    query($slug: String!) {
        ghostPost(slug: { eq: $slug }) {
            ...GhostPostFields
            localFeatureImage {
                childImageSharp {
                    fluid( maxHeight: 500) {
                        aspectRatio
                        src
                        srcSet
                        sizes
                    }
                }
            }
        }
    }
`
