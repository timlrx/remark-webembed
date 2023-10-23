/**
 * @typedef {Object} WebEmbedOptions
 * @property {QueryParams} [queryParams]
 */

/**
 * @typedef {Object} QueryParams
 * @property {string} [maxWidth] - max width of embed size
 * @property {string} [maxHeight] - max height of embed size 
 * @property {string} [theme] - theme for the embed, such as "dark" or "light"
 * @property {string} [lang] - language for the embed, e.g. "en", "fr", "vi", etc
 */

/**
 * @typedef {Object} OEmbedResponseType
 * @property {string} type
 * @property {string} [url]
 * @property {number|string} version
 * @property {string} [title]
 * @property {string} [author_name]
 * @property {string} [author_url]
 * @property {string} [provider_name]
 * @property {string} [provider_url]
 * @property {string|number} [cache_age]
 * @property {string} [thumbnail_url]
 * @property {number} [thumbnail_width] - The width of the optional thumbnail.
 * @property {number} [thumbnail_height] - The height of the optional thumbnail.
 * @property {string} [html]
 * @property {import('hast').RootContent} [hast] 
 * @property {number} [width]
 * @property {number} [height]
 */

/**
 * @typedef {Object} Provider
 * @property {boolean} [custom]
 * @property {any} [customClass]
 * @property {boolean} discover
 * @property {boolean} noCustomWrap
 * @property {string} provider_name
 * @property {string} provider_url
 * @property {Endpoints[]} endpoints
 */

/** 
 * @typedef {Object} Endpoints
 * @property {string[]} schemes
 * @property {string} url
 * @property {string} [discovery]
 */

/**
 * @typedef {Object} PlatformType
 * @property {Provider | null} provider
 * @property {string} [targetURL]
 * @property {string} embedURL
 * @property {WebEmbedOptions} options
 * @property {QueryParams} queryParams
 */

/**
 * @typedef {Object} EmbedErrorType
 * @property {"request-error"} type
 * @property {string | null} [html]
 * @property {string} message
 * @property {number} [code]
 */

/**
 * @typedef {Object} ProviderDetails
 * @property {Provider | null} provider
 * @property {string} targetURL
 */

/**
 * @typedef {Object} RequestResponseType
 * @property {OEmbedResponseType | null} data
 */

/**
 * @typedef {Object} APIResponse
 * @property {boolean | true} [error]
 * @property {{} | null} [data]
 * @property {null} [message]
 */

/**
 * @typedef {Object} CustomAttributes
 * @property {number | string} [height]
 * @property {number | string} [width]
 */


export const Types = {}
