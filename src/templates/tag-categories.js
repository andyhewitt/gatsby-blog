import React from "react"
import { Link, graphql } from "gatsby"

const TagsListTemplate = ({ data }) => {
  const posts = data.allMarkdownRemark
  return (
    <ul>
      {posts.nodes.map(post => (
        <li key={post.frontmatter.title}>
          <Link to={post.fields.slug}>
            {post.frontmatter.title}
          </Link>
        </li>
      ))}
    </ul>
  )
}

export default TagsListTemplate

export const pageQuery = graphql`
query CategoryPage($category: String) {
  allMarkdownRemark(filter: {frontmatter: {category: {eq: $category}}}) {
    nodes {
      fields {
        slug
      }
			frontmatter {
				title
			}
    }
  }
}
`

// export const pageQuery = graphql`
// {
//   allMarkdownRemark(filter: {frontmatter: {}}) {
//     group(field: frontmatter___category) {
//           nodes{
// 			fields {
//       slug
//       }
//     }
//       fieldValue
//       totalCount
//     }
//   }
// }
// `
