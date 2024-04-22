const path = require(`path`)
const { postsPerPage } = require(`./src/utils/siteConfig`)
const { paginate } = require(`gatsby-awesome-pagination`)
const { createRemoteFileNode } = require(`gatsby-source-filesystem`);
const camelCase = require(`camelcase`)
/**
 * Here is the place where Gatsby creates the URLs for all the
 * posts, tags, pages and authors that we fetched from the Ghost site.
 */


exports.createSchemaCustomization = ({ actions }) => {
    const { createTypes } = actions;
  
    // creates a relationship between GhostPost and the File node for the optimized image
    createTypes(`
      type GhostPost implements Node {
        localFeatureImage: File @link(from: "fields.localFeatureImage")
      }
      type GhostPage implements Node {
        localFeatureImage: File @link(from: "fields.localFeatureImage")
      }
      type GhostAuthor implements Node {
        localCoverImage: File @link(from: "fields.localCoverImage")
        localProfileImage: File @link(from: "fields.localProfileImage")
      }
      type GhostTag implements Node {
        localFeatureImage: File @link(from: "fields.localFeatureImage")
      }
      type GhostSettings implements Node {
        localCoverImage: File @link(from: "fields.localCoverImage")
        localLogo: File @link(from: "fields.localLogo")
        localIcon: File @link(from: "fields.localIcon")
        accent_color: String
      }
    `); // change "GhostPost" to whatever type you're using from your source plugin
  };
exports.createPages = async ({ graphql, actions }) => {
    const { createPage } = actions

    const result = await graphql(`
    {
        allGhostPost(sort: {published_at: ASC}) {
          edges {
            node {
              slug
            }
          }
        }
        allGhostTag(sort: {name: ASC}) {
          edges {
            node {
              slug
              url
              postCount
            }
          }
        }
        allGhostAuthor(sort: {name: ASC}) {
          edges {
            node {
              slug
              url
              postCount
            }
          }
        }
        allGhostPage(sort: {published_at: ASC}) {
          edges {
            node {
              slug
              url
            }
          }
        }
      }
    `)

    // Check for any errors
    if (result.errors) {
        throw new Error(result.errors)
    }

    // Extract query results
    const tags = result.data.allGhostTag.edges
    const authors = result.data.allGhostAuthor.edges
    const pages = result.data.allGhostPage.edges
    const posts = result.data.allGhostPost.edges

    // Load templates
    const indexTemplate = path.resolve(`./src/templates/index.js`)
    const tagsTemplate = path.resolve(`./src/templates/tag.js`)
    const authorTemplate = path.resolve(`./src/templates/author.js`)
    const pageTemplate = path.resolve(`./src/templates/page.js`)
    const postTemplate = path.resolve(`./src/templates/post.js`)

    // Create tag pages
    tags.forEach(({ node }) => {
        const totalPosts = node.postCount !== null ? node.postCount : 0

        // This part here defines, that our tag pages will use
        // a `/tag/:slug/` permalink.
        const url = `/tag/${node.slug}`

        const items = Array.from({length: totalPosts})

        // Create pagination
        paginate({
            createPage,
            items: items,
            itemsPerPage: postsPerPage,
            component: tagsTemplate,
            pathPrefix: ({ pageNumber }) => (pageNumber === 0) ? url : `${url}/page`,
            context: {
                slug: node.slug
            }
        })
    })

    // Create author pages
    authors.forEach(({ node }) => {
        const totalPosts = node.postCount !== null ? node.postCount : 0

        // This part here defines, that our author pages will use
        // a `/author/:slug/` permalink.
        const url = `/author/${node.slug}`

        const items = Array.from({length: totalPosts})

        // Create pagination
        paginate({
            createPage,
            items: items,
            itemsPerPage: postsPerPage,
            component: authorTemplate,
            pathPrefix: ({ pageNumber }) => (pageNumber === 0) ? url : `${url}/page`,
            context: {
                slug: node.slug
            }
        })
    })

    // Create pages
    pages.forEach(({ node }) => {
        // This part here defines, that our pages will use
        // a `/:slug/` permalink.
        node.url = `/${node.slug}/`

        createPage({
            path: node.url,
            component: pageTemplate,
            context: {
                // Data passed to context is available
                // in page queries as GraphQL variables.
                slug: node.slug,
            },
        })
    })

    // Create post pages
    posts.forEach(({ node }) => {
        // This part here defines, that our posts will use
        // a `/:slug/` permalink.
        node.url = `/${node.slug}/`

        createPage({
            path: node.url,
            component: postTemplate,
            context: {
                // Data passed to context is available
                // in page queries as GraphQL variables.
                slug: node.slug,
            },
        })
    })

    // Create pagination
    paginate({
        createPage,
        items: posts,
        itemsPerPage: postsPerPage,
        component: indexTemplate,
        pathPrefix: ({ pageNumber }) => {
            if (pageNumber === 0) {
                return `/`
            } else {
                return `/page`
            }
        },
    })
}
async function createLocalImagesNodes(nodeTypes, gatsbyNodeHelpers) {
    const {
        node,
        actions,
        store,
        reporter,
        createNodeId,
        cache,
    } = gatsbyNodeHelpers

    const imgNode = nodeTypes.filter(item => item.type === node.internal.type) // leave if node type does not match

    if (imgNode.length === 0) {
        return
    }

    const allImgTags = imgNode[0].imgTags.filter(item => node[item] !== null && node[item] !== undefined) // leave if image field is empty

    if (allImgTags.length === 0) {
        return
    }

    const { createNode, createNodeField } = actions

    const promises = allImgTags.map((tag) => {
        const imgUrl = node[tag] ? node[tag].replace(/^\/\//, `https://`) : ``

        return createRemoteFileNode({
            url: imgUrl,
            store,
            cache,
            createNode,
            parentNodeId: node.id,
            createNodeId,
        })
    })

    let fileNodes

    try {
        fileNodes = await Promise.all(promises)
    } catch (err) {
        reporter.error(`Error processing images ${node.absolutePath ? `file ${node.absolutePath}` : `in node ${node.id}`}:\n ${err}`)
    }

    if (fileNodes) {
        // eslint-disable-next-line array-callback-return
        fileNodes.map((fileNode, i) => {
            //const id = `local${camelCase(allImgTags[i], { pascalCase: true })}`
            //node[id] = fileNode.id
            createNodeField({ node, name: `local${camelCase(allImgTags[i], { pascalCase: true })}`, value: fileNode.id })
        })
    }
}

exports.onCreateNode = async (gatsbyNodeHelpers) => {
    const nodeTypes = [
        {
            type: `GhostAuthor`,
            imgTags: [`cover_image`, `profile_image`],
        },
        {
            type: `GhostTag`,
            imgTags: [`feature_image`],
        },
        {
            type: `GhostPost`,
            imgTags: [`feature_image`],
        },
        {
            type: `GhostPage`,
            imgTags: [`feature_image`],
        },
        {
            type: `GhostSettings`,
            imgTags: [`logo`, `icon`, `cover_image`],
        },
    ]
    if (nodeTypes.filter(item => item.type === gatsbyNodeHelpers.node.internal.type).length !== 0) {
        createLocalImagesNodes(nodeTypes, gatsbyNodeHelpers)
    }
    

    
 };

// exports.onCreateWebpackConfig = ({ stage, actions }) => {
//     actions.setWebpackConfig({
//         resolve: {
//             fallback: { url: require.resolve("url/") },
//         },
//     });
// };