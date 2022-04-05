export default ({ list, noop }) => {
    list.forEach(item => {
        noop(item)
    })
}