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
        storages.create(CONFIG.STORAGES_FILE_KEY).put(CONFIG.CHECKED_FRIENDS_KEY, checked_friends);
    },
    /**
     * 获取已检查的好友
     */
    getCheckedFriends: () => {
        return storages.create(CONFIG.STORAGES_FILE_KEY).get(CONFIG.CHECKED_FRIENDS_KEY, {});
    },
    /**
     * 保存忽略检查的好友
     */
    putIgnoreFriends: (ignore_friends) => {
        storages.create(CONFIG.STORAGES_FILE_KEY).put(CONFIG.IGNORE_FRIENDS_KEY, ignore_friends);
    },
    /**
     * 获取忽略检查的好友
     */
    getIgnoreFriends: () => {
        return storages.create(CONFIG.STORAGES_FILE_KEY).get(CONFIG.IGNORE_FRIENDS_KEY, {});
    }
}