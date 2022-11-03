var handler = require('../request-handler');
var expect = require('chai').expect;
var stubs = require('./Stubs');

describe('Node Server Request Listener Function', function() {
  it('Should answer GET requests for /classes/messages with a 200 status code', function() {
    // This is a fake server request. Normally, the server would provide this,
    // but we want to test our function's behavior totally independent of the server code
    var req = new stubs.request('/classes/messages', 'GET');
    var res = new stubs.response();

    handler.requestHandler(req, res);

    expect(res._responseCode).to.equal(200);
    expect(res._ended).to.equal(true);
  });

  it('Should send back parsable stringified JSON', function() {
    var req = new stubs.request('/classes/messages', 'GET');
    var res = new stubs.response();

    handler.requestHandler(req, res);

    expect(JSON.parse.bind(this, res._data)).to.not.throw();
    expect(res._ended).to.equal(true);
  });

  it('Should send back an array', function() {
    var req = new stubs.request('/classes/messages', 'GET');
    var res = new stubs.response();

    handler.requestHandler(req, res);

    var parsedBody = JSON.parse(res._data);
    expect(parsedBody).to.be.an('array');
    expect(res._ended).to.equal(true);
  });

  it('Should accept posts to /classes/messages', function() {
    var stubMsg = {
      username: 'Jono',
      text: 'Do my bidding!'
    };
    var req = new stubs.request('/classes/messages', 'POST', stubMsg);
    var res = new stubs.response();

    handler.requestHandler(req, res);

    // Expect 201 Created response status
    expect(res._responseCode).to.equal(201);

    // Testing for a newline isn't a valid test
    // TODO: Replace with with a valid test
    //expect(res._data).to.equal(JSON.stringify('\n'));
    console.log('res._data', res._data);
    expect(res._ended).to.equal(true);
  });

  it('After posting two messages, should respond with messages that were previously posted', function() {
    var stubMsg1 = {
      username: 'James',
      text: 'TEST'
    };
    var req1 = new stubs.request('/classes/messages', 'POST', stubMsg1);
    var res1 = new stubs.response();

    handler.requestHandler(req1, res1);


    expect(res1._responseCode).to.equal(201);

    var stubMsg2 = {
      username: 'Jono',
      text: 'Do my bidding!'
    };
    var req2 = new stubs.request('/classes/messages', 'POST', stubMsg2);
    var res2 = new stubs.response();

    handler.requestHandler(req2, res2);


    expect(res2._responseCode).to.equal(201);

    // Now if we request the log for that room the message we posted should be there:
    var req = new stubs.request('/classes/messages', 'GET');
    var res = new stubs.response();

    handler.requestHandler(req, res);

    expect(res._responseCode).to.equal(200);
    console.log('res._data in new test', res._data);

    var messages = JSON.parse(res._data);

    expect(messages.length).to.be.above(0);
    expect(messages[0].username).to.equal('Jono');
    expect(messages[0].text).to.equal('Do my bidding!');
    expect(res._ended).to.equal(true);
  });




  it('Should 404 when asked for a nonexistent file', function() {
    var req = new stubs.request('/arglebargle', 'GET');
    var res = new stubs.response();

    handler.requestHandler(req, res);

    expect(res._responseCode).to.equal(404);
    expect(res._ended).to.equal(true);
  });

  it('Should respond with messages that were previously posted', function() {
    var stubMsg = {
      username: 'Jono',
      text: 'Do my bidding!'
    };
    var req = new stubs.request('/classes/messages', 'POST', stubMsg);
    var res = new stubs.response();

    handler.requestHandler(req, res);


    expect(res._responseCode).to.equal(201);

    // Now if we request the log for that room the message we posted should be there:
    req = new stubs.request('/classes/messages', 'GET');
    res = new stubs.response();

    handler.requestHandler(req, res);

    expect(res._responseCode).to.equal(200);

    var messages = JSON.parse(res._data);

    expect(messages.length).to.be.above(0);
    expect(messages[0].username).to.equal('Jono');
    expect(messages[0].text).to.equal('Do my bidding!');
    expect(res._ended).to.equal(true);
  });

  it('Should delete messages when DELETE is called', function() {
    var stubMsg1 = {
      username: 'Jono',
      text: 'Do my bidding!'
    };
    var req1 = new stubs.request('/classes/messages', 'POST', stubMsg1);
    var res1 = new stubs.response();

    handler.requestHandler(req1, res1);

    var stubMsg2 = {
      username: 'JAMES',
      text: 'TEST'
    };
    var req2 = new stubs.request('/classes/messages', 'POST', stubMsg2);
    var res2 = new stubs.response();

    handler.requestHandler(req2, res2);

    // // Now if we request the log for that room the message we posted should be there:
    // req = new stubs.request('/classes/messages', 'GET');
    // res = new stubs.response();

    // handler.requestHandler(req, res);

    // expect(res._responseCode).to.equal(200);
    var req3 = new stubs.request('/classes/messages', 'DELETE', stubMsg2);
    var res3 = new stubs.response();

    handler.requestHandler(req3, res3);

    var req = new stubs.request('/classes/messages', 'GET');
    var res = new stubs.response();
    handler.requestHandler(req, res);

    var messages = JSON.parse(res._data);
    console.log('messages in delete test', messages);

    expect(messages.length).to.equal(1);
    expect(messages[0].username).to.equal('Jono');
    expect(messages[0].text).to.equal('Do my bidding!');
    expect(res._ended).to.equal(true);
  });

  it('Should return 404 for a nonexistent method', function() {
    var req = new stubs.request('/classes/messages', 'SOMETHING');
    var res = new stubs.response();

    handler.requestHandler(req, res);

    expect(res._responseCode).to.equal(404);
    expect(res._ended).to.equal(true);
  });

  it('Should save all posted messages on the server', function() {
    var stubMsg1 = {
      username: 'Ariel',
      text: 'FIRST'
    };
    var stubMsg2 = {
      username: 'Guillermo',
      text: 'SECOND'
    };

    var req = new stubs.request('/classes/messages', 'POST', stubMsg1);
    var res = new stubs.response();
    handler.requestHandler(req, res);

    req = new stubs.request('/classes/messages', 'POST', stubMsg2);
    res = new stubs.response();
    handler.requestHandler(req, res);

    // Seeing if the messages are actually there
    req = new stubs.request('/classes/messages', 'GET');
    res = new stubs.response();
    handler.requestHandler(req, res);

    expect(res._responseCode).to.equal(200);
    var messages = JSON.parse(res._data);
    expect(messages.length > 0).to.equal(true);
    expect(res._ended).to.equal(true);
  });

});