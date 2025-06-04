
interface SortingStep {
  array: number[];
  comparing: number[];
  sorted: number[];
  current: number[];
}

export class SortingAlgorithms {
  private steps: SortingStep[] = [];

  private addStep(array: number[], comparing: number[] = [], sorted: number[] = [], current: number[] = []) {
    this.steps.push({
      array: [...array],
      comparing: [...comparing],
      sorted: [...sorted],
      current: [...current]
    });
  }

  bubbleSort(array: number[]): SortingStep[] {
    this.steps = [];
    const arr = [...array];
    const n = arr.length;
    const sorted: number[] = [];

    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        this.addStep(arr, [j, j + 1], sorted);
        
        if (arr[j] > arr[j + 1]) {
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          this.addStep(arr, [j, j + 1], sorted);
        }
      }
      sorted.unshift(n - i - 1);
      this.addStep(arr, [], sorted);
    }
    
    sorted.unshift(0);
    this.addStep(arr, [], sorted);
    return this.steps;
  }

  selectionSort(array: number[]): SortingStep[] {
    this.steps = [];
    const arr = [...array];
    const n = arr.length;
    const sorted: number[] = [];

    for (let i = 0; i < n - 1; i++) {
      let minIdx = i;
      this.addStep(arr, [i], sorted, [minIdx]);

      for (let j = i + 1; j < n; j++) {
        this.addStep(arr, [i, j], sorted, [minIdx]);
        
        if (arr[j] < arr[minIdx]) {
          minIdx = j;
          this.addStep(arr, [i, j], sorted, [minIdx]);
        }
      }

      if (minIdx !== i) {
        [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
        this.addStep(arr, [i, minIdx], sorted);
      }
      
      sorted.push(i);
      this.addStep(arr, [], sorted);
    }
    
    sorted.push(n - 1);
    this.addStep(arr, [], sorted);
    return this.steps;
  }

  insertionSort(array: number[]): SortingStep[] {
    this.steps = [];
    const arr = [...array];
    const n = arr.length;
    const sorted = [0];

    this.addStep(arr, [], sorted);

    for (let i = 1; i < n; i++) {
      let key = arr[i];
      let j = i - 1;
      
      this.addStep(arr, [i], sorted, [i]);

      while (j >= 0 && arr[j] > key) {
        this.addStep(arr, [j, j + 1], sorted);
        arr[j + 1] = arr[j];
        this.addStep(arr, [j, j + 1], sorted);
        j--;
      }
      
      arr[j + 1] = key;
      sorted.push(i);
      this.addStep(arr, [], sorted);
    }

    return this.steps;
  }

  mergeSort(array: number[]): SortingStep[] {
    this.steps = [];
    const arr = [...array];
    this.mergeSortHelper(arr, 0, arr.length - 1, []);
    return this.steps;
  }

  private mergeSortHelper(arr: number[], left: number, right: number, sorted: number[]) {
    if (left < right) {
      const mid = Math.floor((left + right) / 2);
      
      this.mergeSortHelper(arr, left, mid, sorted);
      this.mergeSortHelper(arr, mid + 1, right, sorted);
      this.merge(arr, left, mid, right, sorted);
    }
  }

  private merge(arr: number[], left: number, mid: number, right: number, sorted: number[]) {
    const leftArr = arr.slice(left, mid + 1);
    const rightArr = arr.slice(mid + 1, right + 1);
    
    let i = 0, j = 0, k = left;

    while (i < leftArr.length && j < rightArr.length) {
      this.addStep(arr, [left + i, mid + 1 + j], sorted);
      
      if (leftArr[i] <= rightArr[j]) {
        arr[k] = leftArr[i];
        i++;
      } else {
        arr[k] = rightArr[j];
        j++;
      }
      k++;
      this.addStep(arr, [], sorted);
    }

    while (i < leftArr.length) {
      arr[k] = leftArr[i];
      i++;
      k++;
      this.addStep(arr, [], sorted);
    }

    while (j < rightArr.length) {
      arr[k] = rightArr[j];
      j++;
      k++;
      this.addStep(arr, [], sorted);
    }

    for (let idx = left; idx <= right; idx++) {
      if (!sorted.includes(idx)) sorted.push(idx);
    }
    this.addStep(arr, [], sorted);
  }

  quickSort(array: number[]): SortingStep[] {
    this.steps = [];
    const arr = [...array];
    this.quickSortHelper(arr, 0, arr.length - 1, []);
    return this.steps;
  }

  private quickSortHelper(arr: number[], low: number, high: number, sorted: number[]) {
    if (low < high) {
      const pi = this.partition(arr, low, high, sorted);
      sorted.push(pi);
      
      this.quickSortHelper(arr, low, pi - 1, sorted);
      this.quickSortHelper(arr, pi + 1, high, sorted);
    } else if (low === high && !sorted.includes(low)) {
      sorted.push(low);
      this.addStep(arr, [], sorted);
    }
  }

  private partition(arr: number[], low: number, high: number, sorted: number[]): number {
    const pivot = arr[high];
    let i = low - 1;

    this.addStep(arr, [], sorted, [high]);

    for (let j = low; j < high; j++) {
      this.addStep(arr, [j, high], sorted, [high]);
      
      if (arr[j] < pivot) {
        i++;
        [arr[i], arr[j]] = [arr[j], arr[i]];
        this.addStep(arr, [i, j], sorted, [high]);
      }
    }

    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    this.addStep(arr, [i + 1, high], sorted);
    
    return i + 1;
  }

  getSteps(algorithm: string, array: number[]): SortingStep[] {
    switch (algorithm) {
      case 'bubble':
        return this.bubbleSort(array);
      case 'selection':
        return this.selectionSort(array);
      case 'insertion':
        return this.insertionSort(array);
      case 'merge':
        return this.mergeSort(array);
      case 'quick':
        return this.quickSort(array);
      default:
        return this.bubbleSort(array);
    }
  }
}
