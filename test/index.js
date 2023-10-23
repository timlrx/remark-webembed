import { suite } from 'uvu'
import * as assert from 'uvu/assert'
import dedent from 'dedent'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import remarkDirective from 'remark-directive'
import rehypeStringify from 'rehype-stringify'
import remarkWebembed from '../index.js'

/**
 *
 * @param {string} markdown
 * @param {import('../src/types').WebEmbedOptions} [options]
 */
const parse = (markdown, options = {}) => {
  return unified()
    .use(remarkParse)
    .use(remarkDirective)
    .use(remarkWebembed, options)
    .use(remarkRehype)
    .use(rehypeStringify)
    .process(markdown)
    .then((file) => String(file))
}

const remarkWebembedTest = suite('remark-webembed')

remarkWebembedTest('retrieve default oembed provider', async () => {
  const md = dedent`
  ::embed[https://www.youtube.com/watch?v=32I0Qso4sDg]
  rest of the text
  `
  const result = await parse(md)
  const expected = dedent`<div><head></head><body><div class="webembed-wrapper" style="position: relative; overflow: hidden; width: 100%; padding-top: 56.49999999999999%;"><iframe width="100%" height="100%" src="https://www.youtube.com/embed/32I0Qso4sDg?feature=oembed" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen title="[HOONIGAN] Gymkhana 2020: Travis Pastrana Takeover; Ultimate Hometown Shred in an 862hp Subaru STI" style="position: absolute; top: 0; left: 0; border: 0;" class="webembed-iframe"></iframe></div></body></div>
<p>rest of the text</p>`
  assert.is(result, expected)
})

remarkWebembedTest('oembed provider with fix width and height', async () => {
  const md = dedent`
  ::embed[https://www.youtube.com/watch?v=32I0Qso4sDg]
  `
  const result = await parse(md, { queryParams: { maxWidth: '500', maxHeight: '500' } })
  const expected = dedent`<div><head></head><body><div class="webembed-wrapper" style="position: relative; overflow: hidden; width: 100%; padding-top: 56.49999999999999%;"><iframe width="500" height="500" src="https://www.youtube.com/embed/32I0Qso4sDg?feature=oembed" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen title="[HOONIGAN] Gymkhana 2020: Travis Pastrana Takeover; Ultimate Hometown Shred in an 862hp Subaru STI" style="position: absolute; top: 0; left: 0; border: 0;" class="webembed-iframe"></iframe></div></body></div>`
  assert.is(result, expected)
})

remarkWebembedTest('handle endpoint with {format}', async () => {
  const md = dedent`
  ::embed[http://coub.com/view/3cqmor]
  `
  const result = await parse(md)
  const expected = dedent`<div><head></head><body><div class="webembed-wrapper" style="position: relative; overflow: hidden; width: 100%; padding-top: 56.25%;"><iframe src="//coub.com/embed/3cqmor?maxheight=360&#x26;maxwidth=640" allowfullscreen frameborder="0" allow="autoplay" width="100%" height="100%" style="position: absolute; top: 0; left: 0; border: 0;" class="webembed-iframe"></iframe></div></body></div>`
  assert.is(result, expected)
})

// Many of the endpoint schemas are http, we match https as well
remarkWebembedTest('match both http and https', async () => {
  const md = dedent`
  ::embed[https://coub.com/view/3cqmor]
  `
  const result = await parse(md)
  const expected = dedent`<div><head></head><body><div class="webembed-wrapper" style="position: relative; overflow: hidden; width: 100%; padding-top: 56.25%;"><iframe src="//coub.com/embed/3cqmor?maxheight=360&#x26;maxwidth=640" allowfullscreen frameborder="0" allow="autoplay" width="100%" height="100%" style="position: absolute; top: 0; left: 0; border: 0;" class="webembed-iframe"></iframe></div></body></div>`
  assert.is(result, expected)
})

remarkWebembedTest('retrieve custom github gist provider', async () => {
  const md = dedent`
  ::embed[https://gist.github.com/defunkt/2059]
  `
  const result = await parse(md)
  const expected = dedent`<div><head></head><body><div class="webembed-wrapper" style="position: relative; overflow: hidden; width: 100%; padding-top: 56.25%;"><iframe src="https://gist.github.com/defunkt/2059.pibb" width="100%" height="100%" style="position: absolute; top: 0; left: 0; border: 0;" class="webembed-iframe"></iframe></div></body></div>`
  assert.is(result, expected)
})

remarkWebembedTest.run()
