module.exports = ({ list, noop }) => {
  list.forEach((item) => {
    noop(item);
  });
};
