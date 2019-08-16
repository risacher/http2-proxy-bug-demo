const fs = require('fs');
const express = require('express');
const http = require('http');
const http2 = require('http2');
const proxy = require('http2-proxy');
const finalhandler = require('finalhandler');

const httpAppPort = 3001;
const httpProxyPort = 3002;
const http2ProxyPort = 3003;

const defaultWebHandler = (err, req, res) => {
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
    console.log("App server recieved a GET request");
    res.send("hello world GET\n")
});
app.listen(httpAppPort);


var server = http.createServer({ }).listen(httpProxyPort);
server.on('request', listener);

var https_options;
var https_server;

config = {
    serverKey: "localhost-privkey.pem",
    serverCert: "localhost-cert.pem"
};

function init_https() {
  https_options = {
    key: fs.readFileSync(config.serverKey, 'utf8'),
    cert: fs.readFileSync(config.serverCert, 'utf8')
  };
  if (https_server) { https_server.close(); }
  https_server = http2.createSecureServer(https_options).listen({port:http2ProxyPort});
  https_server.on('request', listener);
}


init_https();
