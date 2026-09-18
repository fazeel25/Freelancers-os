import test from 'node:test';
import assert from 'node:assert/strict';
import { generateProposal, invoiceTotal, monthlyRevenue, projectProgress } from '../public/core.js';
test('project progress reflects completed tasks', () => assert.equal(projectProgress([{done:true},{done:false}]), 50));
test('invoice total includes tax', () => assert.deepEqual(invoiceTotal([{quantity:2,rate:1000}], 10), { subtotal:2000, tax:200, total:2200 }));
test('monthly revenue counts paid invoices', () => assert.equal(monthlyRevenue([{amount:500,status:'Paid'},{amount:300,status:'Pending'}]), 500));
test('proposal includes client and project', () => assert.match(generateProposal({client:'Ayesha',project:'website',price:50000}), /Ayesha[\s\S]*website/));
