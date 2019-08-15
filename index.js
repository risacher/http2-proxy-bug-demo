const express = require('express');
const http = require('http');
const http2 = require('http2');
const proxy = require('http2-proxy');
const finalhandler = require('finalhandler');

const defaultWebHandler = (err, req, res) => {
  console.log('cpC');
  if (err) {
    console.error('proxy error', err)
    finalhandler(req, res)(err)
  }
}

const route = function (req) {
    var target = {
	host: "localhost",
	hostname: "localhost",
	port: 3001,
	path: '/',
	protocol: 'http',
    }
    return target;
}

const listener = function (req, res) {
  
    var target = route(req);
    proxy.web(req, res,
              { 
                  onReq: (req, options) => {
                      options.host = target.host;                  
                      options.hostname = target.hostname;
                      options.port = target.port;
                      options.path = target.path;
                      options.protocol = target.protocol+':';
                      
                      var r = (target.protocol === 'http')?
			  http.request(options)
			  : https.request(options);
                      return r;
                  },
              }, defaultWebHandler );
}

const app = express();
app.get('/', function (req, res) {
  res.send("hello world GET\n")
});
app.listen(3001);


var server = http.createServer({ allowHTTP1: true }).listen(3002);
server.on('request', listener);


