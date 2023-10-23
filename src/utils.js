import urlMetaData from 'url-metadata'
import fetch from 'cross-fetch'
import { fromHtmlIsomorphic } from 'hast-util-from-html-isomorphic'
import { visit } from 'unist-util-visit'

/**
 *
 * @param {string} html
 * @returns
 */
export const htmlToHast = (html) => {
  const tree = fromHtmlIsomorphic(html)
  return tree.children[0]
}

/**
 *
 * @param {import('./types').OEmbedResponseType} oembedResponse
 * @param {import('./types').CustomAttributes} customAttributes
 * @returns
 */
export function wrapHTML(oembedResponse, customAttributes = {}) {
  const { width = '100%', height = '100%' } = customAttributes
  const fHeight = Number(oembedResponse.height) > 0 ? Number(oembedResponse.height) : 360
  const fWidth = Number(oembedResponse.width) > 0 ? Number(oembedResponse.width) : 640
  const paddingTop = fHeight / fWidth
  const { html = '' } = oembedResponse
  const hast = htmlToHast(html)
  visit(hast, 'element', (node, index, parent) => {
    if (node.tagName === 'iframe') {
      // Update 'width' and 'height' attributes from customAttributes
      node.properties = {
        ...(node.properties || {}),
        width: width,
        height: height,
        style: 'position: absolute; top: 0; left: 0; border: 0;',
        class: 'webembed-iframe',
      }

      // Create a new 'div' element to wrap the 'iframe'
      const divWrapper = {
        type: 'element',
        tagName: 'div',
        properties: {
          class: 'webembed-wrapper',
          style: `position: relative; overflow: hidden; width: 100%; padding-top: ${paddingTop * 100
            }%;`,
        },
        children: [node],
      }

      // @ts-ignore
      parent.children[index] = divWrapper
    }
  })
  return hast
}

/**
 *
 * @param {urlMetaData.Result} data
 * @returns {Promise<string>}
 */
export const wrapFallbackHTML = async (data) => {
  let mainURL
  const ogDesc = typeof data['og:description'] === 'string' ? data['og:description'] : ''
  const desc = ogDesc ? ogDesc : typeof data.description === 'string' ? data.description : ''

  let coverImage = data['og:image'] || data.image

  try {
    // @ts-ignore
    mainURL = new URL(data['og:url'] || data.url).hostname
  } catch (error) {
    mainURL = '/'
  }

  const description = `${desc.substring(0, 150)}${desc.length > 150 ? '...' : ''}`

  return `
      <div class="webembed-fallback-card">
        <a
          target="_blank"
          rel="noopener"
          href=${data['og:url'] || data.url}
        >
          <div
            class="webembed-fallback-image"
            style="background-image: url('${coverImage}?w=1600&h=840&fit=crop&crop=entropy&auto=format,enhance&q=60')"
          ></div>
        </a>
      </div>
	`
}

/**
 * @param {string} url
 * @returns {Promise<import('./types').RequestResponseType>}
 */
export const makeRequest = async (url) => {
  try {
    const response = await fetch(url)
    if (response.ok) {
      const responseData = await response.json()
      return responseData
    } else {
      throw new Error(`Request failed with status ${response.status}`)
    }
  } catch (error) {
    // console.log(error);
    return null
  }
}

/**
 *
 * @param {string} url
 */
export const getMetaData = (url) =>
  new Promise((resolve, reject) => {
    urlMetaData(url).then(
      (metadata) => {
        resolve(metadata)
      },
      (error) => {
        // failure handler
        console.log(error)
        reject(error)
      }
    )
  })

/**
 * @param {string} url
 * @param {import('./types').Provider} provider
 * @param {import('./types').QueryParams} queryParams
 */
export async function fetchOembed(url, provider, queryParams) {
  // Use https endpoint only
  const endpoint = provider.endpoints[0].url
    .replace(/\{format\}/g, 'json')
    .replace('http://', 'https://')
  const query = {
    url,
    format: 'json',
    ...queryParams,
  }

  const params = new URLSearchParams(query).toString()
  const res = await fetch(endpoint + '?' + params)
  const status = res.status
  if (status >= 400) {
    throw new Error(`Request failed with error code ${status}`)
  }

  try {
    const text = await res.text()
    return JSON.parse(text.trim())
  } catch (err) {
    throw new Error('Failed to convert data to JSON object')
  }
}
