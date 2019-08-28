const fs = require('fs');
const url = require('url');
const WebSocketServer = require('ws').Server;
const express = require('express');
const http = require('http');
const http2 = require('http2');
const proxy = require('http2-proxy');
const socketio = require('socket.io');
const finalhandler = require('finalhandler');

const httpAppPort = 3001;
const httpProxyPort = 3002;
const http2ProxyPort = 3003;

const defaultWebHandler = (err, req, res) => {
  if (err) {
    console.error('web proxy error', err)
    finalhandler(req, res)(err)
  }
}

const defaultWSHandler = (err, req, socket, head) => {
  if (err) {
    console.error('ws proxy error', err)
    socket.destroy()
  }
}


const route = function (req) {
//    console.log(req);
    var target = {
	method: req.method,
	host: "localhost",
	hostname: "localhost",
	port: httpAppPort,
	path: req.url,
	protocol: 'http:',
    }
    target.path = target.path.replace(/^\/alternate/, '');
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
                      options.protocol = target.protocol;
                      var r = (target.protocol === 'http:')?
			  http.request(options)
			  : https.request(options);
                      return r;
                  },
              }, defaultWebHandler );
}

const upgrade = function (req, socket, head) {
    var target = route(req);
    console.log('REQ', req.headers, req.url);
    if (null != target) {
        console.log('TARGET', target);
      proxy.ws(req, socket, head, target, defaultWSHandler);
  } else {
    socket.close()
  }
};

//
// TINY LITTLE APP SERVER
//

const app = express();
app.get('/', function (req, res) {
    console.log("App server recieved a GET request");
    res.sendFile(__dirname + '/index.html');
});

const appServer = http.createServer(app);
const wss = new WebSocketServer({
   noServer: true
});

wss.on('connection', (ws) => {
  ws.send('hello');

  ws.on('message', (data) => {
    ws.send('message received: ', data);
  });
  ws.on('close', () => {
    console.log('socket closed');
  });
});

appServer.on('request', function (req, resp) {
    console.log('appserver request to '+req.url);
});
appServer.on('upgrade', function upgrade(request, socket, head) {
  const pathname = url.parse(request.url).pathname;

  if (pathname === '/socketEndpoint') {
    wss.handleUpgrade(request, socket, head, function done(ws) {
      wss.emit('connection', ws, request);
    });
  } else {
    socket.destroy();
  }
});

appServer.listen(httpAppPort);



//var io = socketio(appServer);

//io.on('connection', function(socket){
//    console.log('a user connected');
//});


var server = http.createServer({ }).listen(httpProxyPort);
server.on('request', listener);
server.on('upgrade', upgrade);

var https_options;
var https_server;

config = {
    serverKey: "localhost-privkey.pem",
    serverCert: "localhost-cert.pem"
};

function init_https() {
  https_options = {
    key: fs.readFileSync(config.serverKey, 'utf8'),
    cert: fs.readFileSync(config.serverCert, 'utf8'),
    allowHTTP1: true
  };
  if (https_server) { https_server.close(); }
  https_server = http2.createSecureServer(https_options).listen({port:http2ProxyPort});
  https_server.on('request', listener);
  https_server.on('upgrade', upgrade);
}


init_https();
