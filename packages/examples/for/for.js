module.exports = ({ list, noop }) => {
  for (let i = 0; i < list.length; i++) {
    noop(list[i]);
  }
};
