/* eslint no-new: 0 */
/**
 * Mnemonist Vantage Point Tree Unit Tests
 * ========================================
 */
var assert = require('assert'),
    VPTree = require('../vp-tree.js'),
    levenshtein = require('leven');

var WORDS = [
  'book',
  'back',
  'bock',
  'lock',
  'mack',
  'shock',
  'ephemeral',
  'magistral',
  'shawarma',
  'falafel',
  'onze',
  'douze',
  'treize',
  'quatorze',
  'quinze'
];

var WORST_CASE = [
  'abc',
  'abc',
  'abc',
  'bde',
  'bde',
  'cd',
  'cd',
  'abc'
];

function identity(a, b) {
  return +(a !== b);
}

function euclid2d(a, b) {
  var dx = a[0] - b[0],
      dy = a[1] - b[1];

  return Math.sqrt(dx * dx + dy * dy);
}

// function print(tree) {
//   var data = tree.data,
//       stack = [[0, 0]],
//       L = data.length / 2;

//   while (stack.length) {
//     var [index, level] = stack.pop();

//     if (data[index + 1]) {
//       console.log('-'.repeat(level * 2) + '[' + tree.items[data[index]] + ', ' + data[index + 1] + ']');
//     }
//     else {
//       console.log('-'.repeat(level * 2) + '[' + tree.items[data[index]] + ']');
//     }

//     if (data[index + 2])
//       stack.push([data[index + 2], level + 1]);
//     if (data[index + 3])
//       stack.push([data[index + 3], level + 1]);
//   }
// }

describe('VPTree', function() {

  it('should throw if invalid arguments are given.', function() {

    assert.throws(function() {
      new VPTree(null);
    }, /distance/);

    assert.throws(function() {
      new VPTree(Function.prototype);
    }, /items/);
  });

  it.skip('should properly build the tree.', function() {
    var tree = new VPTree(levenshtein, WORDS);

    assert.strictEqual(tree.size, 15);
    assert.deepStrictEqual(Array.from(tree.data), [14, 6, 8, 4, 9, 7, 28, 24, 13, 5, 0, 12, 12, 4, 0, 16, 11, 2, 0, 20, 10, 0, 0, 0, 7, 8.5, 48, 44, 8, 7, 0, 32, 4, 1.5, 40, 36, 3, 0, 0, 0, 1, 0, 0, 0, 2, 1, 0, 56, 6, 8, 0, 52, 5, 0, 0, 0, 0, 0, 0, 0]);
  });

  it.skip('should also work in the worst case scenario.', function() {
    var tree = new VPTree(identity, WORST_CASE);

    assert.strictEqual(tree.size, 8);
    assert.deepStrictEqual(Array.from(tree.data), [7, 1, 8, 4, 6, 1, 24, 20, 2, 0, 0, 12, 1, 0, 0, 16, 0, 0, 0, 0, 4, 0, 0, 28, 5, 0, 0, 0, 3, 0, 0, 0]);
  });

  it('should be possible to find the k nearest neighbors.', function() {
    var tree = new VPTree(levenshtein, WORDS);

    var neighbors = tree.nearestNeighbors(2, 'look');

    assert.deepStrictEqual(neighbors, [
      {distance: 1, item: 'lock'},
      {distance: 1, item: 'book'}
    ]);

    neighbors = tree.nearestNeighbors(5, 'look');

    assert.deepStrictEqual(neighbors, [
      {distance: 1, item: 'lock'},
      {distance: 1, item: 'book'},
      {distance: 2, item: 'bock'},
      {distance: 3, item: 'mack'},
      {distance: 3, item: 'back'}
    ]);
  });

  it('should be possible to find every neighbor within radius.', function() {
    var tree = new VPTree(levenshtein, WORDS);

    assert.deepStrictEqual(tree.neighbors(2, 'look'), [
      {distance: 2, item: 'bock'},
      {distance: 1, item: 'book'},
      {distance: 1, item: 'lock'}
    ]);

    assert.deepStrictEqual(tree.neighbors(3, 'look'), [
      {distance: 3, item: 'shock'},
      {distance: 2, item: 'bock'},
      {distance: 1, item: 'book'},
      {distance: 3, item: 'mack'},
      {distance: 3, item: 'back'},
      {distance: 1, item: 'lock'}
    ]);
  });

  it('should be possible to create a tree from an arbitrary iterable.', function() {
    var tree = VPTree.from(new Set(WORDS), levenshtein);

    assert.strictEqual(tree.size, 15);

    assert.deepStrictEqual(tree.nearestNeighbors(2, 'look'), [
      {distance: 1, item: 'lock'},
      {distance: 1, item: 'book'}
    ]);
  });

  it('should be possible to insert arbitrary items in the tree.', function() {
    var items = WORDS.map(function(item) {
      return {value: item};
    });

    var tree = new VPTree(function(a, b) {
      return levenshtein(a.value, b.value);
    }, items);

    assert.deepStrictEqual(tree.nearestNeighbors(2, {value: 'look'}), [
      {distance: 1, item: {value: 'lock'}},
      {distance: 1, item: {value: 'book'}}
    ]);
  });

  it('should return all nearest neighbors correctly (issue #147).', function() {
    var tree = new VPTree(euclid2d, [[-100, -100], [100, 100]]);

    var neighbors = tree.nearestNeighbors(2, [100, 100]);

    assert.deepStrictEqual(neighbors, [
      {distance: 0, item: [100, 100]},
      {distance: Math.sqrt(80000), item: [-100, -100]}
    ]);

    tree = new VPTree(euclid2d, [[-100, -100], [100, 100], [100, 100], [100, 100]]);

    neighbors = tree.nearestNeighbors(3, [100, 100]);

    assert.deepStrictEqual(neighbors, [
      {distance: 0, item: [100, 100]},
      {distance: 0, item: [100, 100]},
      {distance: 0, item: [100, 100]}
    ]);
  });
});
