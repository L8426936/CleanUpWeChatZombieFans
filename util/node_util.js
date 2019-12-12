module.exports = {
    /**
     * 从该节点向上回溯找到第一个可点击的节点并点击
     * @param {*} node
     * @return 没有找到可点击的节点返回false，否则返回点击结果
     */
    backtrackClickNode: (node) => {
        while (node != null) {
            if (node.clickable()) {
                return node.click();
            } else {
                node = node.parent();
            }
        }
        return false;
    },
}