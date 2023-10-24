// Register `hName`, `hProperties` types, used when turning markdown to HTML:
/// <reference types="mdast-util-to-hast" />
// Register directive nodes in mdast:
/// <reference types="mdast-util-directive" />

/**
 * @typedef {import('./types.js').WebEmbedOptions} Options
 * @typedef {import('mdast-util-directive').TextDirective} TextDirective
 * @typedef {import('mdast-util-directive').LeafDirective} LeafDirective
 * @typedef {import('mdast-util-directive').ContainerDirective} ContainerDirective
 */

import { visit } from 'unist-util-visit'
import get from './modules/webembed-handler.js'
import { htmlToHast } from './utils.js'
/**
 * Remark plugin to embed web content using markdown directives
 *
 * @param {Options} options plugin options
 */
export default function remarkWebembed(options) {
  /**
   * @param {import('mdast').Root} tree
   *   Tree.
   * @param {import('vfile').VFile} file
   *   File.
   * @returns {Promise<undefined>}
   *   Nothing.
   */
  return async (tree, file) => {
    /** @type {(TextDirective | LeafDirective | ContainerDirective)[]} url */
    const embedNodes = []
    visit(tree, (node) => {
      if (
        node.type === 'textDirective' ||
        node.type === 'leafDirective' ||
        node.type === 'containerDirective'
      ) {
        if (node.name !== 'embed') return
        embedNodes.push(node)

        if (node.type === 'textDirective') {
          file.fail('Unexpected `:embed` text directive, use two colons for a leaf directive', node)
        }
      }
    })

    for (const node of embedNodes) {
      const data = node.data || (node.data = {})

      const url = node.children[0].type === 'text' && node.children[0].value
      const results = await get(url, options)
      if (!results.error) {
        const hast = results.output.hast ? results.output.hast : htmlToHast(results.output.html)
        data.hName = 'div'
        data.hChildren = hast.children
      }
    }
  }
}
