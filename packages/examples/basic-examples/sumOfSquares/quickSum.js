module.exports = ({ list, square }) => {
  let length = list.length;
  let sum = 0;
  for (let i = 0; i < length / 2; i++) {
    sum += square(list[i]) + square(list[length - i - 1]);
  }
  return sum;
};
