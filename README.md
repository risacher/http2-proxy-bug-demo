# http2-proxy-bug-demo
demonstration of a possible bug in http2-proxy

1. runs a test http server on port 3001 that responds with "hello world GET".

2. runs a proxy port 3002 that proxies requests to port 3001.



With http2-proxy version 4.2.15, the proxy works:

curl http://localhost:3001/
curl http://localhost:3002/

both respond with "hello world GET"

But with http2-proxy version 5.0.32, the test server works the same,
but the proxy server hangs until it times out.  The proxy request is
never issued.  Tested with nodejs version 12.8.0.