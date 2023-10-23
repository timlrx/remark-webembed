import { useEffect } from 'react'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import remarkDirective from 'remark-directive'
import rehypeStringify from 'rehype-stringify'
import remarkWebembed from '../../index.js'

function Example({ markdown, options }) {
  useEffect(() => {
    unified()
      .use(remarkParse)
      .use(remarkDirective)
      .use(remarkWebembed)
      .use(remarkRehype)
      .use(rehypeStringify)
      .process(markdown)
      .then((file) => {
        document.getElementById('results').innerHTML = file
      })
  }, [markdown, options])

  return (
    <div className="w-screen">
      <div className="flex lg:space-x-12 flex-col lg:flex-row w-screen">
        <div className="mt-8 lg:max-w-[600px]">
          <h2 className="text-2xl mb-2">Markdown text</h2>
          <div
            className="pb-4 font-mono text-sm overflow-auto whitespace-pre bg-gray-800 text-white rounded p-4"
            id="markdown"
          >
            {markdown}
          </div>
          <h2 className="text-2xl mt-4 mb-2">Settings</h2>
          <div className="pb-4 bg-gray-200 whitespace-pre overflow-auto rounded p-4" id="markdown">
            {JSON.stringify({ options: { queryParams: {} } }, null, 2)}
          </div>
        </div>
        <div className="mt-4 lg:mt-8 w-screen">
          <h2 className="text-2xl mb-2">Result</h2>
          <div
            className="prose pb-4 marker:text-black bg-blue-100 rounded p-4 prose-a:text-gray-800 hover:prose-a:text-gray-600 prose-a:no-underline"
            id="results"
          >
            processing markdown...
          </div>
        </div>
      </div>
    </div>
  )
}

export default Example
