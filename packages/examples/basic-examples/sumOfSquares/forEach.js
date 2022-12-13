module.exports = ({ list, square }) => {
  let sum = 0;
  list.forEach((item) => {
    sum += square(item);
  });
  return sum;
};
