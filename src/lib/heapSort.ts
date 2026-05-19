/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Heap Sort implementation for generic objects.
 */
export function heapSort<T>(
  array: T[],
  compareFn: (a: T, b: T) => number
): T[] {
  const arr = [...array];
  const n = arr.length;

  // Build max heap
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heapify(arr, n, i, compareFn);
  }

  // Extract elements from heap
  for (let i = n - 1; i > 0; i--) {
    // Move current root to end
    [arr[0], arr[i]] = [arr[i], arr[0]];

    // Call max heapify on the reduced heap
    heapify(arr, i, 0, compareFn);
  }

  return arr;
}

function heapify<T>(
  arr: T[],
  n: number,
  i: number,
  compareFn: (a: T, b: T) => number
) {
  let largest = i;
  const left = 2 * i + 1;
  const right = 2 * i + 2;

  if (left < n && compareFn(arr[left], arr[largest]) > 0) {
    largest = left;
  }

  if (right < n && compareFn(arr[right], arr[largest]) > 0) {
    largest = right;
  }

  if (largest !== i) {
    [arr[i], arr[largest]] = [arr[largest], arr[i]];
    heapify(arr, n, largest, compareFn);
  }
}
