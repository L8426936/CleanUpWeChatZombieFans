module.exports = {
    /**
     * 保存关系异常的好友
     * @param abnormal_friends
     */
    putAbnormalFriends: (abnormal_friends) => {
        storages.create(CONFIG.STORAGES_FILE_KEY).put(CONFIG.ABNORMAL_FRIENDS_KEY, abnormal_friends);
    },
    /**
     * 获取关系异常的好友
     * @returns
     */
    getAbnormalFriends: () => {
        return storages.create(CONFIG.STORAGES_FILE_KEY).get(CONFIG.ABNORMAL_FRIENDS_KEY, {});
    },
    /**
     * 保存已检查的好友
     */
    putCheckedFriends: (checked_friends) => {
        storages.create(CONFIG.STORAGES_FILE_KEY).put(CONFIG.CHECKED_FRIENDS, checked_friends);
    },
    /**
     * 获取已检查的好友
     */
    getCheckedFriends: () => {
        return storages.create(CONFIG.STORAGES_FILE_KEY).get(CONFIG.CHECKED_FRIENDS, {});
    }
}