module.exports = ({ list, square }) => {
  return list.reduce((acc, i) => (acc += square(i)), 0);
};
