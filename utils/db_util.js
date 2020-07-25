module.exports = (() => {
    importClass(android.database.sqlite.SQLiteDatabase);
    importClass(android.content.ContentValues);
    importClass(android.database.Cursor);
    
    const ABNORMAL_FRIEND_TYPE = 1, NORMAL_FRIEND_TYPE = 2, IGNORED_FRIEND_TYPE = 3;

    /**
     * 打开数据库连接
     */
    function open() {
        return SQLiteDatabase.openDatabase(files.cwd() + "/data/we_chat.db", null, SQLiteDatabase.OPEN_READWRITE);
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
     * @property {boolean} deleted
     * @property {number} friend_type
     */
    /**
     * 新增好友
     * @param {Friend} friend 
     * @returns {boolean} 
     */
    function addFriend(friend) {
        let db = open();
        let values = new ContentValues();
        for (let key in friend) {
            values.put(key, String(friend[key]));
        }
        let result = db.insert("friends", null, values);
        close(db);
        return result > 0;
    }

    /**
     * @typedef FriendWhitelist
     * @property {string} friend_remark
     * @property {boolean} ignored
     */
    /**
     * 新增好友
     * @param {FriendWhitelist} friend_whitelist 
     * @returns {boolean} 
     */
    function addFriendWhitelist(friend_whitelist) {
        let db = open();
        let values = new ContentValues();
        for (let key in friend_whitelist) {
            values.put(key, String(friend_whitelist[key]));
        }
        let result = db.insert("friend_whitelist", null, values);
        close(db);
        return result > 0;
    }

    /**
     * @typedef LabelWhitelist
     * @property {string} label
     * @property {boolean} ignored
     */
    /**
     * 新增好友
     * @param {LabelWhitelist} label_whitelist 
     * @returns {boolean} 
     */
    function addLabelWhitelist(label_whitelist) {
        let db = open();
        let values = new ContentValues();
        for (let key in label_whitelist) {
            values.put(key, String(label_whitelist[key]));
        }
        let result = db.insert("label_whitelist", null, values);
        close(db);
        return result > 0;
    }

    /**
     * 
     * @param {*} friend_label_whitelist
     */
    function addFriendLabelWhitelist(friend_label_whitelist) {
        let db = open();
        let values = new ContentValues();
        for (let key in friend_label_whitelist) {
            values.put(key, String(friend_label_whitelist[key]));
        }
        let result = db.insert("friend_label_whitelist", null, values);
        close(db);
        return result > 0;
    }

    /**
     * @returns {Friend}
     */
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
     * @returns {boolean} 
     */
    function hasFriendByWeChatID(we_chat_id) {
        let db = open();
        let cursor = db.rawQuery("SELECT * FROM friends WHERE we_chat_id = ?", [we_chat_id]);
        let result = cursor.getCount();
        cursor.close();
        close(db);
        return result > 0;
    }
    
    /**
     * 是否有记录
     * @param {string} friend_remark 好友备注
     * @returns {boolean} 
     */
    function hasFriendByFriendRemark(friend_remark) {
        let db = open();
        let cursor = db.rawQuery("SELECT * FROM friends WHERE friend_remark = ? AND friend_type != ?", [friend_remark, IGNORED_FRIEND_TYPE]);
        let result = cursor.getCount();
        cursor.close();
        close(db);
        return result > 0;
    }

    /**
     * @param {String} label 
     * @returns {boolean} 
     */
    function hasLabelWhitelist(label) {
        let db = open();
        let cursor = db.rawQuery("SELECT * FROM label_whitelist WHERE label = ?", [label]);
        let result = cursor.getCount();
        cursor.close();
        close(db);
        return result > 0;
    }

    /**
     * 
     * @param {String} friend_remark 
     * @param {String} label 
     * @returns {boolean}
     */
    function hasFriendLabelWhitelist(friend_remark, label) {
        let db = open();
        let cursor = db.rawQuery("SELECT * FROM friend_label_whitelist WHERE friend_remark = ? AND label = ?", [friend_remark, label]);
        let result = cursor.getCount();
        cursor.close();
        close(db);
        return result > 0;
    }

    /**
     * 忽略有该标签的好友
     * @param {Array<String>} labels 
     * @returns {boolean} 
     */
    function ignoredLabels(labels) {
        let db = open();
        let sql = "SELECT * FROM label_whitelist WHERE ignored = 'true' AND label IN(";
        for (let i = 0; i < labels.length; i++) {
            sql += "?,";
        }
        sql = sql.slice(0, -1);
        sql += ")";
        let cursor = db.rawQuery(sql, labels);
        let result = cursor.getCount();
        cursor.close();
        close(db);
        return result > 0;
    }

    /**
     * @param {String} friend_remark 
     * @returns {boolean} 
     */
    function hasFriendWhitelist(friend_remark) {
        let db = open();
        let cursor = db.rawQuery("SELECT * FROM friend_whitelist WHERE friend_remark = ?", [friend_remark]);
        let result = cursor.getCount();
        cursor.close();
        close(db);
        return result > 0;
    }

    /**
     * 忽略该备注的好友
     * @param {String} friend_remark 
     * @returns {boolean} 
     */
    function ignoredFriendRemark(friend_remark) {
        let db = open();
        let cursor = db.rawQuery("SELECT * FROM friend_whitelist WHERE ignored = 'true' AND friend_remark = ?", [friend_remark]);
        let result = cursor.getCount();
        cursor.close();
        close(db);
        return result > 0;
    }

    /**
     * 是否有选中好友
     * @param {string} friend_remark 好友备注
     * @returns {boolean} 
     */
    function hasSelectedFriendByFriendRemark(friend_remark) {
        let db = open();
        let cursor = db.rawQuery("SELECT * FROM friends WHERE deleted = 'false' AND selected = 'true' AND friend_remark = ? AND friend_type != ?", [friend_remark, IGNORED_FRIEND_TYPE]);
        let result = cursor.getCount();
        cursor.close();
        close(db);
        return result > 0;
    }
    
    /**
     * 是否有选中好友
     * @param {string} we_chat_id 微信号
     * @returns {boolean} 
     */
    function hasSelectedFriendByWeChatID(we_chat_id) {
        let db = open();
        let cursor = db.rawQuery("SELECT * FROM friends WHERE deleted = 'false' AND selected = 'true' AND we_chat_id = ? AND friend_type != ?", [we_chat_id, IGNORED_FRIEND_TYPE]);
        let result = cursor.getCount();
        cursor.close();
        close(db);
        return result > 0;
    }

    /**
     * 是否有选中待删除的好友
     * @returns {boolean} 
     */
    function hasSelectedFriend() {
        return countSelectedFriend() > 0;
    }

    /**
     * 统计待删除的好友
     * @returns {Number} 
     */
    function countSelectedFriend() {
        let db = open();
        let cursor = db.rawQuery("SELECT * FROM friends WHERE deleted = 'false' AND selected = 'true' AND friend_type != ?", [IGNORED_FRIEND_TYPE]);
        let result = cursor.getCount();
        cursor.close();
        close(db);
        return result;
    }

    /**
     * @param {Friend} friend 
     * @returns {boolean} 
     */
    function modifyFriend(friend) {
        let db = open();
        let values = new ContentValues();
        for (let key in friend) {
            if (key == "we_chat_id") {
                continue;
            }
            values.put(key, String(friend[key]));
        }
        let result = db.update("friends", values, "we_chat_id = ?", [friend["we_chat_id"]]);
        close(db);
        return result > 0;
    }

    /**
     * @param {FriendWhitelist} friend_whitelist 
     * @returns {boolean} 
     */
    function modifyFriendWhitelist(friend_whitelist) {
        let db = open();
        let values = new ContentValues();
        for (let key in friend_whitelist) {
            if (key == "friend_remark") {
                continue;
            }
            values.put(key, String(friend_whitelist[key]));
        }
        let result = db.update("friend_whitelist", values, "friend_remark = ?", [friend_whitelist["friend_remark"]]);
        close(db);
        return result > 0;
    }

    /**
     * @param {LabelWhitelist} label_whitelist 
     * @returns {boolean} 
     */
    function modifyLabelWhitelist(label_whitelist) {
        let db = open();
        let values = new ContentValues();
        for (let key in label_whitelist) {
            if (key == "label") {
                continue;
            }
            values.put(key, String(label_whitelist[key]));
        }
        let result = db.update("label_whitelist", values, "label = ?", [label_whitelist["label"]]);
        close(db);
        return result > 0;
    }

    function modifyFriendLabelWhitelist(label_whitelist) {
        let db = open();
        let result = db.execSQL("UPDATE friend_whitelist SET ignored = '" + label_whitelist.ignored + "' WHERE friend_remark IN (SELECT friend_remark FROM friend_label_whitelist WHERE label = '" + label_whitelist.label +"' GROUP BY friend_remark)");
        close(db);
        return result > 0;
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

    function findAllFriendWhitelist(page) {
        let db = open();
        let cursor = db.rawQuery("SELECT * FROM friend_whitelist LIMIT 200 OFFSET ?", [((page || 1) - 1) * 200]);
        let friend_whitelist = [];
        while (cursor.moveToNext()) {
            friend_whitelist.push(
                {
                    friend_remark: cursor.getString(cursor.getColumnIndex("friend_remark")),
                    ignored: cursor.getString(cursor.getColumnIndex("ignored")) == 'true'
                }
            );
        }
        cursor.close();
        close(db);
        return friend_whitelist;
    }

    function findAllLabelWhitelist() {
        let db = open();
        let cursor = db.rawQuery("SELECT * FROM label_whitelist", null);
        let label_whitelist = [];
        while (cursor.moveToNext()) {
            label_whitelist.push(
                {
                    label: cursor.getString(cursor.getColumnIndex("label")),
                    ignored: cursor.getString(cursor.getColumnIndex("ignored")) == 'true'
                }
            );
        }
        cursor.close();
        close(db);
        return label_whitelist;
    }

    function getTotalPageByFriendType(friend_type) {
        let db = open();
        let cursor = db.rawQuery("SELECT * FROM friends WHERE friend_type = ?", [friend_type]);
        let total_page = parseInt(Math.ceil(cursor.getCount() / 200));
        cursor.close();
        close(db);
        return total_page;
    }

    function getTotalPageByFriendsWhitelist() {
        let db = open();
        let cursor = db.rawQuery("SELECT * FROM friend_whitelist", null);
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

    function deleteAllFriendWhitelist() {
        let db = open();
        db.execSQL("DELETE FROM friend_whitelist");
        close(db);
    }

    function deleteAllFriendLabelWhitelist() {
        let db = open();
        db.execSQL("DELETE FROM friend_label_whitelist");
        close(db);
    }

    /**
     * 
     * @param {String} friend_remark 
     * @returns {boolean} 
     */
    function deleteFriendLabelWhitelist(friend_remark) {
        let db = open();
        let result = db.delete("friend_label_whitelist", "friend_remark = ?", [friend_remark]);
        close(db);
        return result > 0;
    }

    /**
     * 
     * @param {String} friend_remark 
     * @returns {boolean} 
     */
    function deleteFriendWhitelist(friend_remark) {
        let db = open();
        let result = db.delete("friend_whitelist", "friend_remark = ?", [friend_remark]);
        close(db);
        return result > 0;
    }

    function deleteAllLabelWhitelist() {
        let db = open();
        db.execSQL("DELETE FROM label_whitelist");
        close(db);
    }

    function updateDatabase() {
        let base_path = files.cwd();
        files.ensureDir(base_path + "/data/");
        let db = SQLiteDatabase.openOrCreateDatabase(base_path + "/data/we_chat.db", null);

        db.execSQL("CREATE TABLE IF NOT EXISTS friends("
        + "we_chat_id VARCHAR(64) PRIMARY KEY,"
        + "friend_remark VARCHAR(128),"
        + "abnormal_message VARCHAR(255),"
        + "selected BOOLEAN,"
        + "deleted BOOLEAN,"
        + "friend_type TINYINT"
        + ")");

        db.execSQL("CREATE TABLE IF NOT EXISTS friend_whitelist("
        + "friend_remark VARCHAR(128) PRIMARY KEY,"
        + "ignored BOOLEAN"
        + ")");

        db.execSQL("CREATE TABLE IF NOT EXISTS label_whitelist("
        + "label VARCHAR(64) PRIMARY KEY,"
        + "ignored BOOLEAN"
        + ")");

        db.execSQL("CREATE TABLE IF NOT EXISTS friend_label_whitelist("
        + "friend_remark VARCHAR(128),"
        + "label VARCHAR(64),"
        + "PRIMARY KEY (friend_remark, label)"
        + ")");

        close(db);
    }

    return {
        addFriend: addFriend,
        addFriendWhitelist: addFriendWhitelist,
        addLabelWhitelist: addLabelWhitelist,
        addFriendLabelWhitelist: addFriendLabelWhitelist,
        modifyFriend: modifyFriend,
        modifyFriendWhitelist: modifyFriendWhitelist,
        modifyLabelWhitelist: modifyLabelWhitelist,
        modifyFriendLabelWhitelist: modifyFriendLabelWhitelist,
        hasSelectedFriendByWeChatID: hasSelectedFriendByWeChatID,
        hasSelectedFriendByFriendRemark: hasSelectedFriendByFriendRemark,
        hasSelectedFriend: hasSelectedFriend,
        hasFriendByWeChatID: hasFriendByWeChatID,
        hasFriendByFriendRemark: hasFriendByFriendRemark,
        hasLabelWhitelist: hasLabelWhitelist,
        hasFriendLabelWhitelist: hasFriendLabelWhitelist,
        ignoredLabels: ignoredLabels,
        hasFriendWhitelist: hasFriendWhitelist,
        ignoredFriendRemark: ignoredFriendRemark,
        findAllAbnormalFriend: findAllAbnormalFriend,
        getAbnormalFriendTotalPage: getAbnormalFriendTotalPage,
        findAllNormalFriend: findAllNormalFriend,
        getNormalFriendTotalPage: getNormalFriendTotalPage,
        findAllIgnoredFriend: findAllIgnoredFriend,
        findAllFriendWhitelist: findAllFriendWhitelist,
        getTotalPageByFriendsWhitelist: getTotalPageByFriendsWhitelist,
        findAllLabelWhitelist: findAllLabelWhitelist,
        countSelectedFriend: countSelectedFriend,
        deleteAllIgnoredFriend: deleteAllIgnoredFriend,
        getIgnoredFriendTotalPage: getIgnoredFriendTotalPage,
        deleteAllFriend: deleteAllFriend,
        deleteAllFriendWhitelist: deleteAllFriendWhitelist,
        deleteAllFriendLabelWhitelist: deleteAllFriendLabelWhitelist,
        deleteFriendLabelWhitelist: deleteFriendLabelWhitelist,
        deleteFriendWhitelist: deleteFriendWhitelist,
        deleteAllLabelWhitelist: deleteAllLabelWhitelist,
        updateDatabase: updateDatabase,
        ABNORMAL_FRIEND_TYPE: ABNORMAL_FRIEND_TYPE,
        NORMAL_FRIEND_TYPE: NORMAL_FRIEND_TYPE,
        IGNORED_FRIEND_TYPE: IGNORED_FRIEND_TYPE
    };
})();