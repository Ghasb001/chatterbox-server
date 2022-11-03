/*************************************************************

You should implement your request handler function in this file.

requestHandler is already getting passed to http.createServer()
in basic-server.js, but it won't work as is.

You'll have to figure out a way to export this function from
this file and include it in basic-server.js so that it actually works.

*Hint* Check out the node module documentation at http://nodejs.org/api/modules.html.

**************************************************************/

var defaultCorsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type, accept, authorization',
  'access-control-max-age': 10 // Seconds.
};

var messages = [];

var requestHandler = function(request, response) {
  module.exports = {};
  // Request and Response come from node's http module.
  //
  // They include information about both the incoming request, such as
  // headers and URL, and about the outgoing response, such as its status
  // and content.
  //
  // Documentation for both request and response can be found in the HTTP section at
  // http://nodejs.org/documentation/api/

  // Do some basic logging.
  //
  // Adding more logging to your server can be an easy way to get passive
  // debugging help, but you should always be careful about leaving stray
  // console.logs in your code.

  var url = request.url;
  var method = request.method;
  var messagesPath = '/classes/messages';


  console.log('Serving request type ' + request.method + ' for url ' + request.url);


  // The outgoing status.
  //status code is an OK status; else 404 for not found
  var statusCode;

  // See the note below about CORS headers.
  var headers = defaultCorsHeaders;

  // Tell the client we are sending them plain text.
  //
  // You will need to change this if you are sending something
  // other than plain text, like JSON or HTML.
  //headers['Content-Type'] = 'text/plain';
  headers['Content-Type'] = 'application/json';

  var acceptableMethods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'];
  if (acceptableMethods.indexOf(method) === -1) {
    statusCode = 404;
    response.writeHead(statusCode, headers);
    response.end([{error: 'action not found'}]);
  }



  if (request.method === 'GET') {
    if (url === messagesPath) {
      statusCode = 200;
      response.writeHead(statusCode, headers);
      response.end(JSON.stringify(messages));
    } else {
      statusCode = 404;
      response.writeHead(statusCode, headers);
      response.end([{error: 'messages not found'}]);
    }
  }


  if (request.method === 'POST') {
    if (url === messagesPath) {
      statusCode = 201;
      response.writeHead(statusCode, headers);

      var body = '';

      request.on('error', (err) => {
        console.error(err);
      }).on('data', (chunk) => {
        body += chunk;
      }).on('end', () => {
        messages.push(JSON.parse(body));

        response.end(JSON.stringify(messages));

        // body = Buffer.concat(body).toString();
        // if (messages.includes(body)) {
        //   statusCode = 200;
        //   response.writeHead(statusCode, headers);
        //   response.end(JSON.stringify(messages));
        // } else {
        //   statusCode = 201;
        //   response.writeHead(statusCode, headers);
        //   messages.push(body);
        //   response.end(JSON.stringify(messages));
        // }

      });
    } else {
      statusCode = 404;
      response.writeHead(statusCode, headers);
      response.end([{error: 'path not found'}]);
    }
  }




  /*
    let body = [];
  request.on('error', (err) => {
    console.error(err);
  }).on('data', (chunk) => {
    body.push(chunk);
  }).on('end', () => {
    body = Buffer.concat(body).toString();
    // BEGINNING OF NEW STUFF

    response.on('error', (err) => {
      console.error(err);
    });

    response.statusCode = 200;
    response.setHeader('Content-Type', 'application/json');
    // Note: the 2 lines above could be replaced with this next one:
    // response.writeHead(200, {'Content-Type': 'application/json'})

    const responseBody = { headers, method, url, body };

    response.write(JSON.stringify(responseBody));
    response.end();
    */


  // .writeHead() writes to the request line and headers of the response,
  // which includes the status and all headers.
  //response.writeHead(statusCode, headers);

  // Make sure to always call response.end() - Node may not send
  // anything back to the client until you do. The string you pass to
  // response.end() will be the body of the response - i.e. what shows
  // up in the browser.
  //
  // Calling .end "flushes" the response's internal buffer, forcing
  // node to actually send all the data over to the client.
  //response.end('Hello, World!');

  if (request.method === 'DELETE') {
    if (url === messagesPath) {

      var body = '';
      request.on('error', (err) => {
        console.error(err);
      }).on('data', (chunk) => {
        body += chunk;
      }).on('end', () => {
        console.log('body', body);
        console.log('messages', messages);
        var removed = 0;
        for (var i = 0; i < messages.length; i++) {
          for (var key in messages[i]) {
            if (key in Object.keys(JSON.parse(body)) && messages[i][key] !== body[key]) {
              break;
            } else {
              messages.splice(i, 1);
              console.log('messages before send', messages);
              statusCode = 200;
              response.writeHead(statusCode, headers);
              removed = 1;
            }
          }
        }
        if (removed === 0) {
          statusCode = 404;
          response.writeHead(statusCode, headers);
        }

        response.end(JSON.stringify(messages));
      });
    } else {
      statusCode = 204;
      response.writeHead(statusCode, headers);
      response.end([{error: 'path not found'}]);
    }
  }


};

// These headers will allow Cross-Origin Resource Sharing (CORS).
// This code allows this server to talk to websites that
// are on different domains, for instance, your chat client.
//
// Your chat client is running from a url like file://your/chat/client/index.html,
// which is considered a different domain.
//
// Another way to get around this restriction is to serve you chat
// client from this domain by setting up static file serving.


module.exports.requestHandler = requestHandler;