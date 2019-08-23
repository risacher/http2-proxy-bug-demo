# http2-proxy-bug-demo
demonstration of a possible bug in http2-proxy

1. runs a test http server on port 3001 that responds with a simple app that starts a websocket with socket.io and prints success on connection. 

2. runs a http proxy port 3002 that proxies requests to port 3001.

3. runs a http2 proxy on port 3003 that proxies requests to port 3001.

With http2-proxy version 4.2.15, and node 10.x, the proxy works:

 http://localhost:3001/ - the app itself works

 http://localhost:3002/ - the http->http proxied app works

 https://localhost:3003/ - the http2->http proxied app works.  allowHTTP1:true is absolutely required.

With http2-proxy version 5.0.34 and node 12.x, this demo still works. 

But my slightly-more complicated proxy server does not always work fine:

node 10 always works with http2-proxy 4.2.15 and 5.0.34 (if allowHTTP1: true is set)

node 12 works with http2-proxy 4.2.15, but DOES NOT WORK with 5.0.34, even with allowHTTP1 set.  specifically, proxied wss connections hang up.  I'm not sure if it's the browser socket that hangs up or the backend socket.  I think, based on the below error, that  it's the backend socket (because the error happens in `_http_client.js`)

```
s proxy error Error: socket hang up
    at connResetException (internal/errors.js:559:14)
    at Socket.socketOnEnd (_http_client.js:433:23)
    at Socket.emit (events.js:208:15)
    at Socket.EventEmitter.emit (domain.js:476:20)
    at endReadableNT (_stream_readable.js:1168:12)
    at processTicksAndRejections (internal/process/task_queues.js:77:11) {
  code: 'ECONNRESET',
  statusCode: 502
  ```
