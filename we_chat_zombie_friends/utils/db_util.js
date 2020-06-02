module.exports = (() => {
    importClass(android.database.sqlite.SQLiteDatabase);
    importClass(android.content.ContentValues);
    importClass(android.database.Cursor);
    
    const ABNORMAL_FRIEND_TYPE = 1, NORMAL_FRIEND_TYPE = 2, IGNORED_FRIEND_TYPE = 3;

    /**
     * 打开数据库连接
     */
    function open() {
        let base_path = files.cwd();
        files.ensureDir(base_path + "/data/");
        if (!files.exists(base_path + "/data/we_chat.db")) {
            let db = SQLiteDatabase.openOrCreateDatabase(base_path + "/data/we_chat.db", null);
            db.execSQL("CREATE TABLE IF NOT EXISTS friends("
            + "we_chat_id VARCHAR(64) PRIMARY KEY,"
            + "friend_remark VARCHAR(64),"
            + "abnormal_message VARCHAR(255),"
            + "selected BOOLEAN,"
            + "deleted BOOLEAN,"
            + "friend_type TINYINT"
            + ")");
            return db;
        }
        return SQLiteDatabase.openDatabase(base_path + "/data/we_chat.db", null, SQLiteDatabase.OPEN_READWRITE);
    }

    /**
     * 关闭数据库连接
     */
    function close(db) {
        if (db != null && db.isOpen()) {
            db.close();
        }
    }

    /**
     * @typedef Friend
     * @property {string} we_chat_id
     * @property {string} friend_remark
     * @property {string} abnormal_message
     * @property {boolean} selected
     * @property {boolean} delteed
     * @property {number} friend_type
     */
    /**
     * 新增好友
     * @param {Friend} friend 
     */
    function addFriend(friend) {
        let db = open();
        let values = new ContentValues();
        for (let key in friend) {
            values.put(key, String(friend[key]));
        }
        let result = db.insert("friends", null, values);
        close(db);
        return result;
    }

    function cursorRowToFriend(cursor) {
        return {
            we_chat_id: cursor.getString(cursor.getColumnIndex("we_chat_id")),
            friend_remark: cursor.getString(cursor.getColumnIndex("friend_remark")),
            abnormal_message: cursor.getString(cursor.getColumnIndex("abnormal_message")),
            selected: cursor.getString(cursor.getColumnIndex("selected")) == 'true',
            deleted: cursor.getString(cursor.getColumnIndex("deleted")) == 'true'
        };
    }

    /**
     * 是否有记录
     * @param {string} we_chat_id 微信号
     */
    function hasFriendByWeChatID(we_chat_id) {
        let db = open();
        let cursor = db.rawQuery("SELECT * FROM friends WHERE we_chat_id = ?", [we_chat_id]);
        let result = cursor.getCount();
        cursor.close();
        close(db);
        return result;
    }
    
    /**
     * 是否有记录
     * @param {string} friend_remark 好友备注
     */
    function hasFriendByFriendRemark(friend_remark) {
        let db = open();
        let cursor = db.rawQuery("SELECT * FROM friends WHERE friend_remark = ?", [friend_remark]);
        let result = cursor.getCount();
        cursor.close();
        close(db);
        return result;
    }

    /**
     * 是否有选中好友
     * @param {string} friend_remark 好友备注
     */
    function hasSelectedFriendByFriendRemark(friend_remark) {
        let db = open();
        let cursor = db.rawQuery("SELECT * FROM friends WHERE deleted = 'false' AND selected = 'true' AND friend_remark = ?", [friend_remark]);
        let result = cursor.getCount();
        cursor.close();
        close(db);
        return result;
    }
    
    /**
     * 是否有选中好友
     * @param {string} we_chat_id 微信号
     */
    function hasSelectedFriendByWeChatID(we_chat_id) {
        let db = open();
        let cursor = db.rawQuery("SELECT * FROM friends WHERE deleted = 'false' AND selected = 'true' AND we_chat_id = ?", [we_chat_id]);
        let result = cursor.getCount();
        cursor.close();
        close(db);
        return result;
    }

    /**
     * 是否有选中待删除的好友
     */
    function hasSelectedFriend() {
        return countSelectedFriend() > 0;
    }

    /**
     * 统计待删除的好友
     */
    function countSelectedFriend() {
        let db = open();
        let cursor = db.rawQuery("SELECT * FROM friends WHERE deleted = 'false' AND selected = 'true'", null);
        let result = cursor.getCount();
        cursor.close();
        close(db);
        return result;
    }

    function modifyFriend(friend) {
        let db = open();
        let values = new ContentValues();
        for (let key in friend) {
            if (key == "we_chat_id") {
                continue;
            }
            values.put(key, String(friend[key]));
        }
        let result = db.update("friends", values, "we_chat_id = ?", [friend["we_chat_id"]]) > 0;
        close(db);
        return result;
    }

    function findAllFriendByFriendType(friend_type, page) {
        let db = open();
        let cursor = db.rawQuery("SELECT * FROM friends WHERE friend_type = ? LIMIT 200 OFFSET ?", [friend_type, (page - 1) * 200]);
        let friends = [];
        while (cursor.moveToNext()) {
            friends.push(cursorRowToFriend(cursor));
        }
        cursor.close();
        close(db);
        return friends;
    }

    function getTotalPageByFriendType(friend_type) {
        let db = open();
        let cursor = db.rawQuery("SELECT * FROM friends WHERE friend_type = ?", [friend_type]);
        let total_page = parseInt(Math.ceil(cursor.getCount() / 200));
        cursor.close();
        close(db);
        return total_page;
    }

    function findAllAbnormalFriend(page) {
        return findAllFriendByFriendType(ABNORMAL_FRIEND_TYPE, page || 1);
    }

    function getAbnormalFriendTotalPage() {
        return getTotalPageByFriendType(ABNORMAL_FRIEND_TYPE);
    }

    function findAllNormalFriend(page) {
        return findAllFriendByFriendType(NORMAL_FRIEND_TYPE, page || 1);
    }

    function getNormalFriendTotalPage() {
        return getTotalPageByFriendType(NORMAL_FRIEND_TYPE);
    }

    function findAllIgnoredFriend(page) {
        return findAllFriendByFriendType(IGNORED_FRIEND_TYPE, page || 1);
    }

    function getIgnoredFriendTotalPage() {
        return getTotalPageByFriendType(IGNORED_FRIEND_TYPE);
    }

    function deleteAllIgnoredFriend() {
        let db = open();
        let result = db.delete("friends", "friend_type = ?", [IGNORED_FRIEND_TYPE]);
        close(db);
        return result;
    }

    function deleteAllFriend() {
        let db = open();
        db.execSQL("DELETE FROM friends");
        close(db);
    }

    return {addFriend: addFriend, modifyFriend: modifyFriend, hasSelectedFriendByWeChatID: hasSelectedFriendByWeChatID, hasSelectedFriendByFriendRemark: hasSelectedFriendByFriendRemark, hasSelectedFriend: hasSelectedFriend, hasFriendByWeChatID: hasFriendByWeChatID, hasFriendByFriendRemark: hasFriendByFriendRemark, findAllAbnormalFriend: findAllAbnormalFriend, getAbnormalFriendTotalPage: getAbnormalFriendTotalPage, findAllNormalFriend: findAllNormalFriend, getNormalFriendTotalPage: getNormalFriendTotalPage, findAllIgnoredFriend: findAllIgnoredFriend, countSelectedFriend: countSelectedFriend, deleteAllIgnoredFriend: deleteAllIgnoredFriend, getIgnoredFriendTotalPage: getIgnoredFriendTotalPage, deleteAllFriend: deleteAllFriend, ABNORMAL_FRIEND_TYPE: ABNORMAL_FRIEND_TYPE, NORMAL_FRIEND_TYPE: NORMAL_FRIEND_TYPE, IGNORED_FRIEND_TYPE: IGNORED_FRIEND_TYPE};
})();