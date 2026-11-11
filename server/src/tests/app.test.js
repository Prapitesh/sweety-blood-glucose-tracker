import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../app.js';
test('health endpoint is available',async()=>{const r=await request(app).get('/api/health');assert.equal(r.status,200);assert.equal(r.body.status,'ok')});
test('readings require authentication',async()=>{const r=await request(app).get('/api/readings');assert.equal(r.status,401)});
