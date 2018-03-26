/**
 * Mnemonist Binary Heap
 * ======================
 *
 * Binary heap implementation.
 */
var comparators = require('./utils/comparators.js'),
    iterate = require('./utils/iterables.js').iterate;

var DEFAULT_COMPARATOR = comparators.DEFAULT_COMPARATOR,
    reverseComparator = comparators.reverseComparator;

/**
 * Heap helper functions.
 */

/**
 * Function used to sift down.
 *
 * @param {function} compare    - Comparison function.
 * @param {array}    heap       - Array storing the heap's data.
 * @param {number}   startIndex - Starting index.
 * @param {number}   i          - Index.
 */
function siftDown(compare, heap, startIndex, i) {
  var item = heap[i],
      parentIndex,
      parent;

  while (i > startIndex) {
    parentIndex = (i - 1) >> 1;
    parent = heap[parentIndex];

    if (compare(item, parent) < 0) {
      heap[i] = parent;
      i = parentIndex;
      continue;
    }

    break;
  }

  heap[i] = item;
}

/**
 * Function used to sift up.
 *
 * @param {function} compare - Comparison function.
 * @param {array}    heap    - Array storing the heap's data.
 * @param {number}   i       - Index.
 */
function siftUp(compare, heap, i) {
  var endIndex = heap.length,
      startIndex = i,
      item = heap[i],
      childIndex = 2 * i + 1,
      rightIndex;

  while (childIndex < endIndex) {
    rightIndex = childIndex + 1;

    if (
      rightIndex < endIndex &&
      compare(heap[childIndex], heap[rightIndex]) >= 0
    ) {
      childIndex = rightIndex;
    }

    heap[i] = heap[childIndex];
    i = childIndex;
    childIndex = 2 * i + 1;
  }

  heap[i] = item;
  siftDown(compare, heap, startIndex, i);
}

/**
 * Function used to push an item into a heap represented by a raw array.
 *
 * @param {function} compare - Comparison function.
 * @param {array}    heap    - Array storing the heap's data.
 * @param {any}      item    - Item to push.
 */
function push(compare, heap, item) {
  heap.push(item);
  siftDown(compare, heap, 0, heap.length - 1);
}

/**
 * Function used to pop an item from a heap represented by a raw array.
 *
 * @param  {function} compare - Comparison function.
 * @param  {array}    heap    - Array storing the heap's data.
 * @return {any}
 */
function pop(compare, heap) {
  var lastItem = heap.pop();

  if (heap.length !== 0) {
    var item = heap[0];
    heap[0] = lastItem;
    siftUp(compare, heap, 0);

    return item;
  }

  return lastItem;
}

/**
 * Function used to pop the heap then push a new value into it, thus "replacing"
 * it.
 *
 * @param  {function} compare - Comparison function.
 * @param  {array}    heap    - Array storing the heap's data.
 * @param  {any}      item    - The item to push.
 * @return {any}
 */
function replace(compare, heap, item) {
  if (heap.length === 0)
    throw new Error('mnemonist/heap.replace: cannot pop an empty heap.');

  var popped = heap[0];
  heap[0] = item;
  siftUp(compare, heap, 0);

  return popped;
}

/**
 * Function used to push an item in the heap then pop the heap and return the
 * popped value.
 *
 * @param  {function} compare - Comparison function.
 * @param  {array}    heap    - Array storing the heap's data.
 * @param  {any}      item    - The item to push.
 * @return {any}
 */
function pushpop(compare, heap, item) {
  var tmp;

  if (heap.length !== 0 && compare(heap[0], item) < 0) {
    tmp = heap[0];
    heap[0] = item;
    item = tmp;
    siftUp(compare, heap, 0);
  }

  return item;
}

/**
 * Converts and array into an abstract heap in linear time.
 *
 * @param {function} compare - Comparison function.
 * @param {array}    array   - Target array.
 */
function heapify(compare, array) {
  var n = array.length,
      l = n >> 1,
      i = l;

  while (--i >= 0)
    siftUp(compare, array, i);
}

/**
 * Fully consumes the given heap.
 *
 * @param  {function} compare - Comparison function.
 * @param  {array}    heap    - Array storing the heap's data.
 * @return {array}
 */
function consume(compare, heap) {
  var l = heap.length,
      i = 0;

  var array = new Array(heap.length);

  while (i < l)
    array[i++] = pop(compare, heap);

  return array;
}

/**
 * Binary Minimum Heap.
 *
 * @constructor
 */
function Heap(comparator) {
  this.clear();
  this.comparator = comparator || DEFAULT_COMPARATOR;

  if (typeof this.comparator !== 'function')
    throw new Error('mnemonist/Heap.constructor: given comparator should be a function.');
}

/**
 * Method used to clear the heap.
 *
 * @return {undefined}
 */
Heap.prototype.clear = function() {

  // Properties
  this.items = [];
  this.size = 0;
};

/**
 * Method used to push an item into the heap.
 *
 * @param  {any}    item - Item to push.
 * @return {number}
 */
Heap.prototype.push = function(item) {
  push(this.comparator, this.items, item);
  return ++this.size;
};

/**
 * Method used to retrieve the "first" item of the heap.
 *
 * @return {any}
 */
Heap.prototype.peek = function() {
  return this.items[0];
};

/**
 * Method used to retrieve & remove the "first" item of the heap.
 *
 * @return {any}
 */
Heap.prototype.pop = function() {
  if (this.size !== 0)
    this.size--;

  return pop(this.comparator, this.items);
};

/**
 * Method used to pop the heap, then push an item and return the popped
 * item.
 *
 * @param  {any} item - Item to push into the heap.
 * @return {any}
 */
Heap.prototype.replace = function(item) {
  return replace(this.comparator, this.items, item);
};

/**
 * Method used to push the heap, the pop it and return the pooped item.
 *
 * @param  {any} item - Item to push into the heap.
 * @return {any}
 */
Heap.prototype.pushpop = function(item) {
  return pushpop(this.comparator, this.items, item);
};

/**
 * Method used to convert the heap to an array. Note that it basically clone
 * the heap and consumes it completely. This is hardly performant.
 *
 * @return {array}
 */
Heap.prototype.toArray = function() {
  return consume(this.comparator, this.items.slice());
};

/**
 * Convenience known methods.
 */
Heap.prototype.inspect = function() {
  var proxy = this.toArray();

  // Trick so that node displays the name of the constructor
  Object.defineProperty(proxy, 'constructor', {
    value: Heap,
    enumerable: false
  });

  return proxy;
};

/**
 * Binary Maximum Heap.
 *
 * @constructor
 */
function MaxHeap(comparator) {
  this.clear();
  this.comparator = comparator || DEFAULT_COMPARATOR;

  if (typeof this.comparator !== 'function')
    throw new Error('mnemonist/MaxHeap.constructor: given comparator should be a function.');

  this.comparator = reverseComparator(this.comparator);
}

MaxHeap.prototype = Heap.prototype;

/**
 * Static @.from function taking an abitrary iterable & converting it into
 * a heap.
 *
 * @param  {Iterable} iterable   - Target iterable.
 * @param  {function} comparator - Custom comparator function.
 * @return {Heap}
 */
Heap.from = function(iterable, comparator) {
  var heap = new Heap(comparator);

  // // If iterable is an array, we can be clever about it
  // if (iterate.isArrayLike(iterable)) {
  //   var items = iterable.slice();

  // }

  // heapify(comparator, items);
  //   heap.items = items;
  //   heap.size = items.length;

  iterate(iterable, function(value) {
    heap.push(value);
  });

  return heap;
};

MaxHeap.from = function(iterable, comparator) {
  var heap = new MaxHeap(comparator);

  iterate(iterable, function(value) {
    heap.push(value);
  });

  return heap;
};

/**
 * Exporting.
 */
Heap.push = push;
Heap.pop = pop;
Heap.replace = replace;
Heap.pushpop = pushpop;
Heap.heapify = heapify;
Heap.consume = consume;

Heap.MinHeap = Heap;
Heap.MaxHeap = MaxHeap;

module.exports = Heap;
