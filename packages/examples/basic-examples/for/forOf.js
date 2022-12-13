module.exports = ({ list, noop }) => {
  for (const item of list) {
    noop(item);
  }
};
