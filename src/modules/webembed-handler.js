/**
 * @typedef {import('../types').OEmbedResponseType} OEmbedResponseType
 * @typedef {import('../types').ProviderDetails} ProviderDetails
 */
import tryEach from 'async/tryEach'
import Platform from './Platform'
import oEmbedProviders from '../providers/oembed'
import { getMetaData, wrapHTML, wrapFallbackHTML, fetchOembed } from '../utils'

/**
 * @param {string} incomingURL
 * @param {import('../types').WebEmbedOptions} [options]
 */
export default function get(incomingURL, options) {
  try {
    new URL(incomingURL)
  } catch (error) {
    return {
      output: null,
      error: true,
    }
  }

  const handler = new WebembedHandler(incomingURL, options || {})

  return handler.generateResponse()
}

export class WebembedHandler {
  /**
   * The main embed URL.
   * @type {string}
   */
  embedURL

  /**
   * Final response object.
   * @type {Object}
   */
  finalResponse = {}

  /**
   * Query parameters, including the forceFallback flag.
   * @type {import('../types').QueryParams}
   */
  queryParams = {}

  /**
   * The platform object.
   * @type {Platform}
   */
  // @ts-ignore
  platform = {}

  /**
   * The matched platform information.
   * @type {Object | null}
   */
  matchedPlatform = null

  /**
   * Details of the provider.
   * @type {ProviderDetails}
   */
  providerDetails

  /**
   * Additional options.
   * @type {Object}
   */
  options

  /**
   * Creates a new WebembedHandler instance.
   * @param {string} incomingURL - The incoming URL to embed.
   * @param {Object} options - Additional options.
   */
  constructor(incomingURL, options) {
    const { queryParams = {} } = options
    this.embedURL = incomingURL
    this.options = options
    this.queryParams = queryParams
    this.providerDetails = this.detectProvider()
  }

  /**
   * Detects the provider for the given URL.
   * @returns {{ provider: Object, targetURL: string }} - The provider and the target URL.
   */
  detectProvider = () => {
    let destinationProvider = null
    let targetURL = null
    const embedURL = this.embedURL.replace('https://', '').replace('http://', '')

    let found = false
    oEmbedProviders.some((provider) => {
      provider.endpoints.some((endpoint) => {
        if (!endpoint.schemes || endpoint.schemes.length === 0) {
          if (
            embedURL.match(
              endpoint.url
                .replace('https://', '')
                .replace('http://', '')
                .replace(/\*/g, '.*')
                .replace(/\//g, '/')
                .replace(/\//g, '\\/')
            )
          ) {
            targetURL = endpoint.url
            destinationProvider = provider
            return true
          }
          return false
        }

        found = endpoint.schemes.some((scheme) => {
          if (
            embedURL.match(
              scheme
                .replace('https://', '')
                .replace('http://', '')
                .replace(/\*/g, '.*')
                .replace(/\//g, '/')
                .replace(/\//g, '\\/')
            )
          ) {
            targetURL = endpoint.url
            destinationProvider = provider
            return true
          }
          return false
        })
        return found
      })
      return found
    })
    return {
      provider: destinationProvider,
      targetURL: targetURL || this.embedURL,
    }
  }

  /**
   * Generates the oEmbed response.
   * @param {Function} callback - The callback function.
   */
  generateOEmbed = (callback) => {
    const { embedURL, queryParams } = this
    const { provider } = this.providerDetails

    if (!provider || (provider && provider.custom)) {
      callback(true)
      return
    }

    const { noCustomWrap = false } = provider

    fetchOembed(embedURL, provider, { ...queryParams }).then(
      (result) => {
        /** @type {OEmbedResponseType} */
        const final = result

        if (final && 'html' in final && !noCustomWrap) {
          const customAttribute = {}
          if (queryParams.maxHeight) customAttribute['height'] = this.queryParams.maxHeight
          if (queryParams.maxWidth) customAttribute['width'] = this.queryParams.maxWidth
          final.hast = wrapHTML(final, customAttribute)
        }

        callback(null, final)
      },
      (error) => {
        callback(true)
      }
    )
  }

  /**
   * Generates the oEmbed manually.
   * @returns {Promise<OEmbedResponseType | null>} - The oEmbed response.
   */
  generateManually = async () => {
    const { provider, targetURL } = this.providerDetails
    const { embedURL, queryParams } = this

    if (!provider || !targetURL) {
      throw new Error()
    }

    if (provider && provider.custom && provider.customClass) {
      const CustomClass = provider.customClass
      this.platform = new CustomClass({
        provider,
        targetURL,
        embedURL,
        queryParams,
        options: this.options,
      })
    } else {
      this.platform = new Platform({
        provider,
        targetURL,
        embedURL,
        queryParams,
        options: this.options,
      })
    }

    const response = await this.platform.run()
    const customAttribute = {}
    if (queryParams.maxHeight) customAttribute['height'] = this.queryParams.maxHeight
    if (queryParams.maxWidth) customAttribute['width'] = this.queryParams.maxWidth
    response.hast = wrapHTML(response, customAttribute)
    return response
  }

  /**
   * Generates a fallback oEmbed response by scraping metadata.
   * @returns {Promise<Object | null>} - The fallback oEmbed response.
   */
  generateFallback = async () => {
    try {
      const data = await getMetaData(this.embedURL)
      const html = await wrapFallbackHTML(data)
      return { ...data, html }
    } catch (error) {
      return null
    }
  }

  /**
   * Generates the oEmbed output.
   * @returns {Promise<OEmbedResponseType | null>} - The oEmbed response.
   */
  generateOutput = async () => {
    return new Promise((resolve, reject) => {
      // if (this.queryParams.forceFallback) {
      //   tryEach([this.generateFallback], (error, results) => {
      //     if (error) {
      //       return reject(error)
      //     }
      //     return resolve(results)
      //   })
      // }

      const { provider } = this.providerDetails
      let actions = []

      if (provider && provider.provider_name === 'Twitter') {
        actions = [this.generateManually, this.generateFallback]
      } else {
        actions = [this.generateOEmbed, this.generateManually, this.generateFallback]
      }

      tryEach(actions, (error, results) => {
        if (error) {
          reject(error)
        }
        resolve(results)
      })
    })
  }

  /**
   * Generates the final oEmbed response.
   * @returns {Promise<{ output?: OEmbedResponseType | null; error?: boolean }>} - The response object.
   */
  generateResponse = async () => {
    const output = await this.generateOutput()

    if (output) {
      return {
        output,
        error: false,
      }
    }

    return { output: null, error: true }
  }
}
