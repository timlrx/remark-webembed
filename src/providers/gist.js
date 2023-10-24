import Platform from '../modules/Platform.js'

export default class GithubGist extends Platform {
  /**
   * Creates a new GithubGist instance.
   * @param {import('../types.js').PlatformType} args - The platform options.
   */
  constructor(args) {
    super(args)
  }

  /**
   * Runs the GithubGist platform to fetch data.
   * @returns {Promise<import('../types.js').OEmbedResponseType>} - The OEmbed response.
   */
  // @eslint-ignore
  run = async () => {
    const response = {
      version: 0.1,
      type: 'rich',
      title: 'Github Gist',
      html: '',
    }

    return {
      ...response,
      html: `<iframe src="${this.embedURL}.pibb"></iframe>`,
    }
  }
}
