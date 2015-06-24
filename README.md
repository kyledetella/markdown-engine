{{markdown}}
============

[![Build Status](https://travis-ci.org/kyledetella/markdown-engine.svg?branch=master)](https://travis-ci.org/kyledetella/markdown-engine)

A lightweight markdown engine for Express.

## Development

### Install

```bash
$ npm i
```

### Test

```bash
$ npm t
```

## Example

### app.js

```javascript
'use strict';

var express = require('express');
var markdownEngine = require('./util/markdown-engine');

var app = express();

app.engine('md', markdownEngine.configure());

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'md');

...

```

### views/layout.html

```html
<!DOCTYPE html>
<html>
  <head>
    <title>{{title}}</title>
  </head>
  <body>
    {{body}}
  </body>
</html>
```

## Templating

Templates are written using Markdown and provide basic templating features.

```
My middle name is {{name}}
```

```
res.render('template', { name: 'danger' });
```

```
My middle name is danger
```

### Partials

Partials can be included by using the following syntax:

```
{{> partial}}
{{> path/to/partial}}
```

By default, partials are expected to be located in the `views/partials/` directory.

### Caching

Template caching is enabled only in production. `NODE_ENV=production`

## API

### `configure: Function`

The configure call accepts an `Object` as an argument. It is not required, but allows you to specify a `basePath` for the engine. By default partials and templates are expected to live in the `views` directory in the root of your project. If your this directory happens to be placed somewhere else, use `basePath` to define it.

```javascript
app.engine('md', markdownEngine.configure({basePath: __dirname});
```
