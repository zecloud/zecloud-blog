const path = require(`path`)
const { postsPerPage } = require(`./src/utils/siteConfig`)
const { paginate } = require(`gatsby-awesome-pagination`)
const { createRemoteFileNode } = require(`gatsby-source-filesystem`);
/**
 * Here is the place where Gatsby creates the URLs for all the
 * posts, tags, pages and authors that we fetched from the Ghost site.
 */
exports.createSchemaCustomization = ({ actions }) => {
    const { createTypes } = actions;
  
    // creates a relationship between GhostPost and the File node for the optimized image
    createTypes(`
      type GhostPost implements Node {
        localFeatureImage: File @link
      }
    `); // change "GhostPost" to whatever type you're using from your source plugin
  };
exports.createPages = async ({ graphql, actions }) => {
    const { createPage } = actions

    const result = await graphql(`
        {
            allGhostPost(sort: { order: ASC, fields: published_at }) {
                edges {
                    node {
                        slug
                    }
                }
            }
            allGhostTag(sort: { order: ASC, fields: name }) {
                edges {
                    node {
                        slug
                        url
                        postCount
                    }
                }
            }
            allGhostAuthor(sort: { order: ASC, fields: name }) {
                edges {
                    node {
                        slug
                        url
                        postCount
                    }
                }
            }
            allGhostPage(sort: { order: ASC, fields: published_at }) {
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

exports.onCreateNode = async ({
    node,
    actions,
    store,
    createNodeId,
    cache
}) => {
    // Check that we are modifying right node types.
    const nodeTypes = [`GhostPost`, `GhostPage`];
    if (!nodeTypes.includes(node.internal.type)) {
        return;
    }

    const { createNode,createNodeField } = actions;
    if(node.feature_image !== null){
        // Download image and create a File node with gatsby-transformer-sharp.
        const fileNode = await createRemoteFileNode({
            url: node.feature_image,
            store,
            cache,
            createNode,
            parentNodeId: node.id,
            createNodeId
        });
        if (fileNode) {
            // Link File node to GhostPost node at field image.
            //createNodeField({ node, name: "localFeatureImage", value: fileNode.id });
            node.localFeatureImage = fileNode.id;
        }
    }

    
};

// exports.onCreateWebpackConfig = ({ stage, actions }) => {
//     actions.setWebpackConfig({
//         resolve: {
//             fallback: { url: require.resolve("url/") },
//         },
//     });
// };