function doublingAlgorithm(n: number) {
  function f(n: number): [bigint, bigint] {
    if (n === 0) {
      return [0n, 1n];
    } else {
      let [a, b] = f(Math.floor(n / 2));
      let c = a * (b * 2n - a);
      let d = a * a + b * b;
      return n % 2 === 0 ? [c, d] : [d, c + d];
    }
  }
  return f(n)[0];
}

function matrixAlgorithm(n: number) {
  let matrix = [1n, 1n, 1n, 0n];
  let result = [1n, 0n, 0n, 1n];
  function multiplyMatrix(x: Array<bigint>, y: Array<bigint>) {
    return [
      x[0] * y[0] + x[1] * y[2],
      x[0] * y[1] + x[1] * y[3],
      x[2] * y[0] + x[3] * y[2],
      x[2] * y[1] + x[3] * y[3],
    ];
  }
  while (n !== 0) {
    if (n % 2 !== 0) result = multiplyMatrix(result, matrix);
    n = Math.floor(n / 2);
    matrix = multiplyMatrix(matrix, matrix);
  }
  return result[1];
}

function sumAlgorithm(n: number) {
  let a = 0n;
  let b = 1n;
  for (let i = 0; i < n; i++) {
    let c = a + b;
    a = b;
    b = c;
  }
  return a;
}

export { doublingAlgorithm, matrixAlgorithm, sumAlgorithm };
