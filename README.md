# http2-proxy-bug-demo
demonstration of a possible bug in http2-proxy

1. runs a test http server on port 3001 that responds with a simple page that connects back to a websocket and logs success. server listens for UPGRADE connections at /socketEndPoint and sends some test messages. 

2. runs a http proxy port 3002 that proxies from http://host:3002/ to http://localhost:3001/ and also proxies http://host:3002/alt/ to http://localhost:3001/  Proxy server alternates between using proxy.ws(req, socket, head, target, defaultWSHandler) and proxy.ws(...{onReq: }...).  

3. runs a http2 proxy on port 3003 that proxies like #2, but with http2.

With http2-proxy version 4.2.15, the proxy works:

 http://localhost:3001/ - the app itself works

 http://localhost:3002/ - the http->http proxied app works

 http://localhost:3002/alt/ - works

 https://localhost:3003/ - the http2->http proxied app works.  allowHTTP1:true is absolutely required.

 https://localhost:3003/alt/ - works.

With http2-proxy version 5.0.34, the unmapped proxies work, but for the "mapped" /alt/ paths, web proxy works but websocket does not, when using the simpler form of proxy.ws()  The error is: 
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
/
