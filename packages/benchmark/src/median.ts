export function median(numbers: Array<number>) {
  const sorted = numbers.sort();
  const length = sorted.length;
  if (length % 2 === 0) {
    return (sorted[length / 2] + sorted[length / 2 + 1]) / 2;
  } else {
    return sorted[Math.floor(length / 2)];
  }
}
