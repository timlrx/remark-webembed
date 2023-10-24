/**
 * @typedef {import('../types.js').OEmbedResponseType} OEmbedResponseType
 * @typedef {import('../types.js').RequestResponseType} RequestResponseType
 */

import { makeRequest, wrapHTML } from '../utils.js'

class Platform {
  /**
   * @param {import('../types.js').PlatformType} options - The platform options.
   */
  constructor({ provider, targetURL, embedURL, queryParams, options }) {
    /**
     * @type {import('../types.js').Provider | null}
     */
    this.provider = provider

    /**
     * @type {string}
     */
    this.embedURL = embedURL

    /**
     * @type {string | undefined}
     */
    this.targetURL = targetURL

    /**
     * @type {RequestResponseType}
     */
    this.response = null

    /**
     * @type {import('../types.js').QueryParams}}
     */
    this.queryParams = queryParams

    /**
     * @type {import('../types.js').WebEmbedOptions}
     */
    this.options = {
      queryParams: options.queryParams,
    }
  }

  /**
   * Runs the platform to fetch data.
   *
   * @returns {Promise<OEmbedResponseType | null>}
   */
  async run() {
    const params = new URLSearchParams({
      ...this.queryParams,
      url: this.embedURL,
    })

    const response = await makeRequest(`${this.targetURL}?${params.toString()}`)
    this.response = response

    if (response && response.data) {
      let hast

      if (this.provider && !this.provider.noCustomWrap) {
        const customAttribute = {}
        if (this.queryParams.maxHeight) customAttribute['height'] = this.queryParams.maxHeight
        if (this.queryParams.maxWidth) customAttribute['width'] = this.queryParams.maxWidth
        hast = wrapHTML(response.data, customAttribute)
      }

      return {
        version: 0.1,
        type: 'rich',
        title: 'WebEmbed',
        hast,
      }
    }

    return null
  }
}

export default Platform
