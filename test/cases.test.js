const { Node } = require('@twlv/core');
const { Chat } = require('../chat');
const { MemoryFinder } = require('@twlv/core/finders/memory');
const { TcpDialer } = require('@twlv/core/transports/tcp/dialer');
const { TcpListener } = require('@twlv/core/transports/tcp/listener');
const assert = require('assert');

describe('Cases', () => {
  before(() => {
    process.on('unhandledRejection', err => console.error('Unhandled rejection', err));
  });

  after(() => {
    process.removeAllListeners('unhandledRejection');
  });

  describe('send', () => {
    it('send', async () => {
      let chat1 = createChat();
      let chat2 = createChat();

      try {
        await chat1.start();

        await sleep(100);

        await chat1.send({ address: chat2.identity.address, content: 'hello' });

        await sleep(100);

        await chat2.start();

        await sleep(100);

        await chat2.send({ address: chat1.identity.address, content: 'world' });

        await sleep(100);

        assert.deepEqual(chat1.channels, chat2.channels);
      } finally {
        try { await chat1.stop(); } catch (err) {}
        try { await chat2.stop(); } catch (err) {}
      }
    });
  });
});

function createChat () {
  let node = new Node();
  node.addDialer(new TcpDialer());
  node.addListener(new TcpListener());
  node.addFinder(new MemoryFinder(node));
  let chat = new Chat({ node });
  return chat;
}

function sleep (t = 0) {
  return new Promise(resolve => setTimeout(resolve, t));
}
