# Remark Webembed

[remark](https://github.com/wooorm/remark) plugin to embed web content using [markdown directives](https://github.com/remarkjs/remark-directive).

Out of the box support for [oembed](https://oembed.com/) and custom providers. Automatically wraps the iframe into a responsive container.

Can be used on the server or in the browser (though certain oembed API providers block cross-origin requests).

## Installation

This package is [ESM only](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c):
Node 12+ is needed to use it and it must be `import`ed instead of `require`d.

```js
npm install remark-webembed
```

## Usage

```js
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import remarkDirective from 'remark-directive'
import rehypeStringify from 'rehype-stringify'
import remarkWebembed from 'remark-Webembed'

unified()
  .use(remarkParse)
  .use(remarkDirective)
  .use(remarkWebembed, options)
  .use(remarkRehype)
  .use(rehypeStringify)
  .process(markdown)
```

## Sample web embed

Input:

```md
::embed[https://www.youtube.com/watch?v=32I0Qso4sDg]
```

HTML Output:

```html
<div>
  <head></head>
  <body>
    <div
      class="webembed-wrapper"
      style="position: relative; overflow: hidden; width: 100%; padding-top: 56.49999999999999%;"
    >
      <iframe
        width="100%"
        height="100%"
        src="https://www.youtube.com/embed/32I0Qso4sDg?feature=oembed"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen
        title="[HOONIGAN] Gymkhana 2020: Travis Pastrana Takeover; Ultimate Hometown Shred in an 862hp Subaru STI"
        style="position: absolute; top: 0; left: 0; border: 0;"
        class="webembed-iframe"
      ></iframe>
    </div>
  </body>
</div>
```

## API

`remark().use(remarkWebembed, [options])`

### options

#### options.queryParams

Type: `object`.

Query parameters passed to the oembed API. If `maxWidth` or `maxHeight` is specified, it will be applied to the iframe container as well.

Check the oembed provider's documentation for supported query parameters.
