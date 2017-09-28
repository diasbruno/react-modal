import http from 'http';
import path from 'path';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import App from './app';

import MemoryFS from 'memory-fs';

import webpack from 'webpack';
import webpackConfig from '../webpack.config.js';

const fs = new MemoryFS();

webpackConfig.entry = path.resolve(__dirname, './index.js');
webpackConfig.output.path = path.resolve(
  __dirname,
  './__build__'
);
webpackConfig.plugins.shift();
console.log(webpackConfig);
const compiler = webpack(webpackConfig);
compiler.outputFileSystem = fs;

function renderPage(req, res) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');

  var html = ReactDOMServer.renderToStaticMarkup(
    <div id="content">
      <App items={[
             'Item 0',
             'Item 1',
             'Item </scRIpt>\u2028',
             'Item <!--inject!-->\u2029',
           ]} />
      <script src="/__build__/main.js" type="text/javascript"></script>
    </div>
  );

  res.end(
    ['<!DOCTYPE html>',
     html
    ].join('\n')
  );
}

function renderScript(req, res) {
  res.setHeader('Content-Type', 'text/javascript');

  compiler.run((err, stats) => {
    if (err || stats.hasErrors()) {
      console.log(err);
    }
    res.end(fs.readFileSync(path.resolve(__dirname, './__build__/main.js')));
  });
}

function render404(req, res) {
  res.statusCode = 404;
  res.end();
}

http.createServer((req, res) => {
  if (req.url == '/') {
    renderPage(req, res);
  } else if (/\b__build__\b/.test(req.url)) {
    renderScript(req, res);
  } else {
    render404(req, res);
  }
}).listen(3000, function(err) {
  if (err) throw err;
  console.log('Listening on 3000...');
});


function safeStringify(obj) {
  return JSON.stringify(obj)
    .replace(/<\/(script)/ig, '<\\/$1')
    .replace(/<!--/g, '<\\!--')
    .replace(/\u2028/g, '\\u2028') // Only necessary if interpreting as JS, which we do
    .replace(/\u2029/g, '\\u2029'); // Ditto
}
