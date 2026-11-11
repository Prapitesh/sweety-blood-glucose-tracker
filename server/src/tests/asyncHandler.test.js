import test from 'node:test';
import assert from 'node:assert/strict';
import { asyncHandler } from '../middleware/asyncHandler.js';

test('forwards rejected async route handlers to Express error middleware', async () => {
  const expected = new Error('Expected route failure');
  let received;
  const next = (error) => { received = error; };
  const handler = asyncHandler(async () => { throw expected; });

  handler({}, {}, next);
  await new Promise((resolve) => setImmediate(resolve));

  assert.equal(received, expected);
});
