import React from 'react'
import PropTypes from 'prop-types'
import { graphql } from 'gatsby'

import { Layout, PostCard, Pagination } from '../components/common'
import { MetaData } from '../components/common/meta'
import { getImage } from "gatsby-plugin-image";
/**
* Main index page (home page)
*
* Loads all posts from Ghost and uses pagination to navigate through them.
* The number of posts that should appear per page can be setup
* in /utils/siteConfig.js under `postsPerPage`.
*
*/
const Index = ({ data, location, pageContext }) => {
    const posts = data.allGhostPost.edges
    console.log(data)
    return (
        <>
            <MetaData location={location} />
            <Layout isHome={true}>
                <div className="container">
                    <section className="post-feed">
                        {posts.map(({ node }) => (
                           
                            // The tag below includes the markup for each post - components/common/PostCard.js
                            <PostCard key={node.id} post={node}  featuredImage={ getImage(node.localFeatureImage)} />
                        ))}
                    </section>
                    <Pagination pageContext={pageContext} />
                </div>
            </Layout>
        </>
    )
}

Index.propTypes = {
    data: PropTypes.shape({
        allGhostPost: PropTypes.object.isRequired,
    }).isRequired,
    location: PropTypes.shape({
        pathname: PropTypes.string.isRequired,
    }).isRequired,
    pageContext: PropTypes.object,
}

export default Index

// This page query loads all posts sorted descending by published date
// The `limit` and `skip` values are used for pagination
export const pageQuery = graphql`query GhostPostQuery($limit: Int!, $skip: Int!) {
  allGhostPost(sort: {published_at: DESC}, limit: $limit, skip: $skip) {
    edges {
      node {
        ...GhostPostFields
        localFeatureImage {
          childImageSharp {
            gatsbyImageData(
              height: 200
              width: 300
              placeholder: BLURRED
              transformOptions: {cropFocus: CENTER}
              layout: CONSTRAINED
            )
          }
        }
        primary_author {
          localProfileImage {
            childImageSharp {
              gatsbyImageData(
                height: 30
                width: 30
                placeholder: BLURRED
                transformOptions: {cropFocus: CENTER}
                layout: FIXED
              )
            }
          }
        }
      }
    }
  }
}`
