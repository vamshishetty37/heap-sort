/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Heap Sort implementation for generic objects.
 * This sorting algorithm organizes elements by representing them in a binary tree structure (heap).
 * It runs in O(N log N) time complexity for both best, worst, and average cases without using built-in array.sort().
 */
export function heapSort<T>(
  array: T[],
  compareFn: (a: T, b: T) => number
): T[] {
  // Create a shallow copy of the array to avoid mutating input parameters directly
  const arr = [...array];
  const n = arr.length;

  // ==========================================
  // 1. BUILD MAX HEAP
  // ==========================================
  // We start from the last non-leaf node (index = n/2 - 1) and work our way up to the root node (index = 0).
  // This rearranges the array into a valid Max Heap structure, meaning the parent node is always 
  // greater than or equal to its children based on our compareFn.
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heapify(arr, n, i, compareFn);
  }

  // ==========================================
  // 3. FINAL SORTED OUTPUT GENERATION
  // ==========================================
  // One by one, we extract elements from the heap.
  // We swap the root of the heap (which holds the maximum element) with the last element of the heap.
  // Then, we reduce the heap size by 1 and call heapify on the new root to restore max heap properties.
  for (let i = n - 1; i > 0; i--) {
    // === SWAP OPERATION ===
    // Move the current root (the maximum element in current sub-heap) to the end of the unsorted section
    [arr[0], arr[i]] = [arr[i], arr[0]];

    // Call heapify on the reduced heap to restore max-heap order at the root (index 0)
    heapify(arr, i, 0, compareFn);
  }

  // Once all elements are systematically extracted and repositioned, the final sorted array is returned.
  return arr;
}

/**
 * HEAPIFY FUNCTION
 * Maintains the max-heap property. Assumes binary trees at left and right children are max-heaps,
 * but the root (index i) might be violating the property.
 * 
 * @param arr The array representation of the binary heap.
 * @param n Size of the heap configuration.
 * @param i The root index of the subtree to heapify.
 * @param compareFn Comparison logic.
 */
function heapify<T>(
  arr: T[],
  n: number,
  i: number,
  compareFn: (a: T, b: T) => number
) {
  let largest = i; // Initialize largest as root
  const left = 2 * i + 1; // Left child index = 2*i + 1
  const right = 2 * i + 2; // Right child index = 2*i + 2

  // If left child is larger than current largest (based on compareFn evaluation)
  if (left < n && compareFn(arr[left], arr[largest]) > 0) {
    largest = left;
  }

  // If right child is larger than current largest
  if (right < n && compareFn(arr[right], arr[largest]) > 0) {
    largest = right;
  }

  // If largest is not root, then we must perform a swap and recurse
  if (largest !== i) {
    // === SWAP OPERATION ===
    // Exchange the out-of-order parent node with its larger child node to satisfy heap properties
    [arr[i], arr[largest]] = [arr[largest], arr[i]];

    // Recursively heapify the affected key subtree node
    heapify(arr, n, largest, compareFn);
  }
}
