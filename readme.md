# saturated [![codecov](https://badgen.now.sh/codecov/c/github/lukeed/saturated)](https://codecov.io/gh/lukeed/saturated)

> A tiny (205B) utility to enqueue items for batch processing and/or satisfying rate limits.

Build a queue for your function – ideal for communicating with APIs that prefer batch/bulk processing or services that enforce rate limiting.

With `saturated` you provide a `handler` which will only be called every N items or after every X milliseconds... whichever comes first! This then allows you to `push()` your payload(s) into the queue, waiting for the next tick.

This module exposes three module definitions:

* **CommonJS**: `dist/saturated.js`
* **ES Module**: `dist/saturated.mjs`
* **UMD**: `dist/saturated.min.js`


## Install

```
$ npm install --save saturated
```


## Usage

```js
import saturated from 'saturated';

// Setup an instance
const rated = saturated(arr => {
  if (arr.length > 0) {
    console.log('~> Received', arr);
  } else {
    console.log('~> Empty...');
  }
}, {
  max: 5, // limit
  interval: 3e3 // 3s
});

// Now we have a `saturated` instance that will
//   call our function every 3 seconds or once it
//   has 5 items in its queue – whichever comes first.

// For demo purposes
const sleep = ms => new Promise(r => setTimeout(r, ms));

// Demo usage
async function demo() {
  rated.push('hello'); //=> 1
  rated.push('world'); //=> 2
  rated.push('how'); //=> 3
  rated.push('are'); //=> 4
  rated.push('you'); //=> 5

  // Queue received 5th item, immediately invoke!
  // ~> Received ['hello', 'world', 'how', 'are', 'you']
  rated.size(); //=> 0 (flushed)

  rated.push('hola'); //=> 1
  rated.push('mundo'); //=> 2
  rated.size(); //=> 2
  await sleep(3e3);

  // Interval waited 3 seconds
  // ~> Received ['hola', 'mundo']
  rated.size(); //=> 0 (flushed)

  // Wait another 3s ...
  await sleep(3e3);

  // ~> Empty...
  rated.size(); //=> 0 (flushed anyway)
}

// Init demo
demo().then(() => {
  rated.reset(); // quit
});
```


## API

### saturated(handler, options)
Returns: `ISaturated`

#### handler
Type: `Function`<br>
Required: `true`

The function to invoke once a threshold has been met.<br>
It will always receive an `Array` of whatever item(s) you previously [`push`]()ed.

> **Note:** You may be passed an empty Array!

#### options.max
Type: `Number`<br>
Default: `Infinity`

The maximum size of the queue.<br>
For example, with `max: 5`, your `handler` will be invoked immediately after the 5th item was pushed to queue.

> **Important:** Your function will be called if `max` is met ***before*** the next `interval` tick.

#### options.interval
Type: `Number`<br>
Default: `10000`

The amount of time, in milliseconds, to wait before calling your `handler` function.<br>
Defaults to calling your `handler` every 10 seconds, even if the queue is empty.


### ISaturated.size()
Returns: `Number`

Get the current size of the queue.


### ISaturated.push(value)
Returns: `Number`

Add an item/value into the queue stack.<br>
Doing so will return the current size of the queue.

#### value
Type: `Any`

You may push any value into queue.

> **Important:** Anything you push will be added to an Array!
> Pushing an Array will have your `handler` receive an Array of your Arrays.


### ISaturated.reset(toFlush)
Returns: `undefined`

Cancels the internal `setInterval` timer.

#### toFlush
Type: `Boolean`<br>
Default: `false`

When `true`, will also [flush()]() the queue so that remaining items will be passed to your `handler` function.


### ISaturated.flush()
Returns: `undefined`

Forcibly invoke your `handler` will _all_ items currently in the queue.

Calling `flush` will restart the internal `setInterval` timer and empty the queue.


## License

MIT © [Luke Edwards](https://lukeed.com)
