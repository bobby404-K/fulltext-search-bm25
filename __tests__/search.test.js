import assert from 'node:assert';
import test from 'node:test';
import { BM25SearchEngine } from '../dist/inverted-index.js';

test('BM25SearchEngine accurately ranks documents using BM25 relevance score', () => {
  const engine = new BM25SearchEngine();
  engine.addDocument({ id: 'doc1', text: 'Distributed consensus systems like Raft and Paxos provide safety invariants.' });
  engine.addDocument({ id: 'doc2', text: 'Fast key value databases rely on log structured merge trees.' });

  const results = engine.search('Raft consensus');
  assert.strictEqual(results[0].id, 'doc1');
  assert.ok(results[0].score > 0);
});
