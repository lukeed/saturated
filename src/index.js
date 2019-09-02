export default function (caller, opts) {
	opts = opts || {};

	var timer, tmp, queue = [];
	var max = opts.max || Infinity;

	function batch() {
		clearInterval(timer);
		caller(queue.splice(0, max));
		ticker();
	}

	function ticker() {
		timer = setInterval(batch, opts.interval || 10e3);
	}

	ticker();

	return {
		flush: batch,

		push: function () {
			tmp = queue.push(arguments);
			if (tmp >= max) batch();
			return tmp;
		},

		size: function () {
			return queue.length;
		},

		reset: function (toFlush) {
			if (toFlush) batch();
			clearInterval(timer);
		}
	};
}
