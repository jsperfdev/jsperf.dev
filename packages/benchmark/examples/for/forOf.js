export default ({ list, noop }) => {
    for (const item of list) {
        noop(item);
    }
}