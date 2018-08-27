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
      let node1 = new Node();
      let node2 = new Node();
      let chat1 = createChat(node1);
      let chat2 = createChat(node2);

      try {
        await node1.start();
        await node2.start();

        await chat1.start();
        await chat1.send({ address: chat2.identity.address, content: 'hello' });

        await sleep(100);

        await chat2.start();
        await chat2.send({ address: chat1.identity.address, content: 'world' });

        await sleep(100);

        assert.deepStrictEqual(chat1.states, chat2.states);
        assert.deepStrictEqual(chat1.channels, chat2.channels);
      } finally {
        try { await chat1.stop(); } catch (err) {}
        try { await chat2.stop(); } catch (err) {}
        try { await node1.stop(); } catch (err) {}
        try { await node2.stop(); } catch (err) {}
      }
    });
  });
});

function createChat (node) {
  node.addDialer(new TcpDialer());
  node.addListener(new TcpListener());
  node.addFinder(new MemoryFinder(node));
  let chat = new Chat({ node });
  chat.on('error', () => {});
  return chat;
}

function sleep (t = 0) {
  return new Promise(resolve => setTimeout(resolve, t));
}
