import React from "react"
import { Link, graphql } from "gatsby"

import Layout from "../components/layout"

const TagsListTemplate = ({ data, pageContext, location }) => {
	console.log(location);
	const { category } = pageContext;
  const posts = data.allMarkdownRemark
  return (
		<Layout location={location} title={"All posts"}>
			<h1>{category}</h1>
			<ul>
				{posts.nodes.map(post => (
					<li key={post.frontmatter.title}>
						<Link to={post.fields.slug}>
							{post.frontmatter.title}
						</Link>
					</li>
				))}
			</ul>
		</Layout>
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
