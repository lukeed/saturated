import test from 'tape';
import foo from '../src';

test('exports', t => {
	t.is(typeof foo, 'function');
	t.end();
});
