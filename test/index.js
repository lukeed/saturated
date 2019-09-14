import test from 'tape';
import rated from '../src';

const noop = () => {};
const sleep = ms => new Promise(r => setTimeout(r, ms));

test('exports', t => {
	t.is(typeof rated, 'function', 'exports a function');

	const ctx = rated(noop);
	t.is(typeof ctx, 'object', 'returns an object');
	t.is(typeof ctx.flush, 'function', '~> has "flush" function');
	t.is(typeof ctx.push, 'function', '~> has "push" function');
	t.is(typeof ctx.size, 'function', '~> has "size" function');
	t.is(typeof ctx.end, 'function', '~> has "end" function');

	ctx.end();
	t.end();
});


test('$.push', t => {
	const ctx = rated(noop);

	const foo = ctx.push('hello');
	t.is(foo, 1, '~> returns the current queue length');

	const bar = ctx.push('world');
	t.is(bar, 2, '~> returns the current queue length');

	ctx.end();
	t.end();
});


test('$.size', t => {
	const ctx = rated(noop);

	ctx.push('hello');
	const foo = ctx.size();
	t.is(foo, 1, '~> returns the current queue length');

	ctx.push('world');
	const bar = ctx.size();
	t.is(bar, 2, '~> returns the current queue length');

	ctx.end();
	t.end();
});


test('$.flush', t => {
	t.plan(5);

	const ctx = rated(arr => {
		t.true(Array.isArray(arr), 'caller receives Array of items');
		t.is(arr.length, 2, '~> received 2 items');

		const val = ctx.size();
		t.is(val, 0, '~> caller sees 0 queue size');
	});

	ctx.push('hello');
	ctx.push('world');

	t.is(ctx.size(), 2, '(before) has 2 items');
	ctx.flush();
	t.is(ctx.size(), 0, '(after) has 0 items');

	ctx.end();
});


test('$.end', t => {
	t.plan(2);

	const ctx = rated(arr => {
		// NOTE: should not be called!
		t.true(Array.isArray(arr), 'caller receives Array of items');
		t.pass('SHOULD NOT BE CALLED');
	});

	ctx.push('hello');
	ctx.push('world');

	t.is(ctx.size(), 2, '(before) has 2 items');
	ctx.end();
	t.is(ctx.size(), 2, '(after) has 2 items');
});


test('$.end(true)', t => {
	t.plan(5);

	const ctx = rated(arr => {
		t.true(Array.isArray(arr), 'caller receives Array of items');
		t.is(arr.length, 2, '~> received 2 items');

		const val = ctx.size();
		t.is(val, 0, '~> caller sees 0 queue size');
	});

	ctx.push('hello');
	ctx.push('world');

	t.is(ctx.size(), 2, '(before) has 2 items');
	ctx.end(true);
	t.is(ctx.size(), 0, '(after) has 0 items');
});


test('opts.max', t => {
	const now = Date.now();
	const obj = rated(arr => {
		let del = Date.now() - now;
		t.true(Array.isArray(arr), 'caller receives Array of items');
		t.true(del < 3e3, '~> ran before 3s interval');
		t.is(arr.length, 10, '~> received 10 items');
	}, {
		max: 10,
		interval: 3e3
	});

	Array.from({ length:10 }, obj.push);

	obj.end();
	t.end();
});


test('opts.interval', async t => {
	t.plan(6);

	const now = Date.now();
	const ctx = rated(arr => {
		let del = Date.now() - now;
		t.true(Array.isArray(arr), 'caller receives Array of items');
		t.true(del > 3e3, '~> ran after 3s interval');
		t.is(arr.length, 5, '~> received 5 items');
		t.is(ctx.size(), 0, '~> instance fully drained');
	}, {
		interval: 3e3
	});

	// --
	Array.from({ length:5 }, ctx.push);
	// --

	t.is(ctx.size(), 5, '(before) has 5 items');
	await sleep(5e3);
	t.is(ctx.size(), 0, '(after) has 0 items');

	ctx.end();
});
