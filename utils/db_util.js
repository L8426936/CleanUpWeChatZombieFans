module.exports = (() => {
    importClass(android.database.sqlite.SQLiteDatabase);
    importClass(android.content.ContentValues);
    importClass(android.database.Cursor);
    
    const ABNORMAL_FRIEND_TYPE = 1, NORMAL_FRIEND_TYPE = 2, IGNORED_FRIEND_TYPE = 3, PAGE_SIZE = 200;
    /**
     * @typedef TestedFriend
     * @property {String} we_chat_id
     * @property {String} friend_remark
     * @property {String} abnormal_message
     * @property {boolean} selected
     * @property {boolean} deleted
     * @property {int} friend_type
     */
    const PROPERTY_MAPPING_TYPE_FOR_TESTED_FRIEND = {
        "we_chat_id": "String",
        "friend_remark": "String",
        "abnormal_message": "String",
        "selected": "boolean",
        "deleted": "boolean",
        "friend_type": "int"
    };
    /**
     * @typedef Label
     * @property {String} label
     * @property {String} count
     * @property {boolean} enabled
     */
    const PROPERTY_MAPPING_TYPE_FOR_LABEL = {
        "label": "String",
        "count": "String",
        "enabled": "boolean"
    };
    /**
     * @typedef Friend
     * @property {String} friend_remark
     * @property {boolean} enabled
     */
    const PROPERTY_MAPPING_TYPE_FOR_FRIEND = {
        "friend_remark": "String",
        "enabled": "boolean"
    };
    /**
     * @typedef LabelFriend
     * @property {String} label 
     * @property {String} friend_remark 
     * @property {boolean} enabled
     */
    const PROPERTY_MAPPING_TYPE_FOR_LABEL_FRIEND = {
        "label": "String",
        "friend_remark": "String",
        "enabled": "boolean"
    };

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
     * 查询结果集转对象
     * @param {Object} cursor
     * @returns {Object}
     */
    function cursorToObject(cursor, property_mapping_type) {
        let object = {};
        for (let i = cursor.getColumnCount() - 1; i >= 0; i--) {
            let column_name = cursor.getColumnName(i);
            switch (property_mapping_type[column_name]) {
                case "String":
                    object[column_name] = cursor.getString(i);
                    break;
                case "boolean":
                    object[column_name] = cursor.getString(i) == "true";
                    break;
                case "int":
                    object[column_name] = cursor.getInt(i);
                    break;
            }
        }
        return object;
    }

    /**
     * 新增一行记录
     * @param {String} table_name 
     * @param {Object} object 
     * @returns {boolean}
     */
    function addRow(table_name, object) {
        let db = open();
        let values = new ContentValues();
        for (let key in object) {
            values.put(key, String(object[key]));
        }
        let result = db.insert(table_name, null, values);
        close(db);
        return result > 0;
    }

    /**
     * 删除记录
     * @param {String} table_name 
     * @param {String} where_clause 
     * @param {Array<String>} where_args 
     * @returns {boolean}
     */
    function deleteRows(table_name, where_clause, where_args) {
        let db = open();
        let result = db.delete(table_name, where_clause, where_args);
        close(db);
        return result > 0;
    }

    /**
     * 修改记录
     * @param {String} table_name 
     * @param {Object} object 
     * @param {String} where_key 
     * @returns {boolean}
     */
    function modifyRow(table_name, object, where_key) {
        let db = open();
        let values = new ContentValues();
        for (let key in object) {
            if (key == where_key) {
                continue;
            }
            values.put(key, String(object[key]));
        }
        let result = db.update(table_name, values, where_key + " = ?", [object[where_key]]);
        close(db);
        return result > 0;
    }

    /**
     * 查询记录
     * @param {String} sql 
     * @param {Array<String>} selection_args 
     * @param {Object} property_mapping_type 
     * @returns {Array<Object>}
     */
    function findRows(sql, selection_args, property_mapping_type) {
        let db = open();
        let list = [];
        let cursor = db.rawQuery(sql, selection_args);
        while (cursor.moveToNext()) {
            list.push(cursorToObject(cursor, property_mapping_type));
        }
        cursor.close();
        close(db);
        return list;
    }

    /**
     * 存在记录
     * @param {String} sql 
     * @param {Array<String>} selection_args 
     * @returns {boolean}
     */
    function isExistRow(sql, selection_args) {
        let db = open();
        let cursor = db.rawQuery(sql, selection_args);
        let result = cursor.getCount();
        cursor.close();
        close(db);
        return result > 0;
    }

    /**
     * 统计行数
     * @param {String} sql 
     * @param {Array<String>} selection_args 
     * @returns {int}
     */
    function countRow(sql, selection_args) {
        let db = open();
        let cursor = db.rawQuery(sql, selection_args);
        let count = cursor.getCount();
        cursor.close();
        close(db);
        return count;
    }

    /**
     * 获取记录页数
     * @param {String} sql 
     * @param {Array<String>} selection_args 
     * @returns {int}
     */
    function getTotalPage(sql, selection_args) {
        return parseInt(Math.ceil(countRow(sql, selection_args) / PAGE_SIZE));
    }

    /**
     * 新增已测试的好友
     * @param {TestedFriend} tested_friend 
     * @returns {boolean} 
     */
    function addTestedFriend(tested_friend) {
        return addRow("tested_friend_list", tested_friend);
    }

    /**
     * 新增标签
     * @param {Label} label 
     * @returns {boolean} 
     */
    function addLabel(label) {
        return addRow("label_list", label);
    }

    /**
     * 新增好友
     * @param {Friend} friend 
     * @returns {boolean} 
     */
    function addFriend(friend) {
        return addRow("friend_list", friend);
    }

    /**
     * 新增标签，好友联动
     * @param {LabelFriend} label_friend
     * @returns {boolean} 
     */
    function addLabelFriend(label_friend) {
        return addRow("label_friend_list", label_friend);
    }

    /**
     * 删除所有已测试的好友
     * @returns {boolean} 
     */
    function deleteAllTestedFriend() {
        return deleteRows("tested_friend_list", null, null);
    }

    /**
     * 删除已忽略测试的好友
     * @returns {boolean} 
     */
    function deleteIgnoredTestFriend() {
        return deleteRows("tested_friend_list", "we_chat_id IN (SELECT friend_remark FROM tested_friend_list WHERE friend_type != ? GROUP BY friend_remark) AND friend_type = ?", [IGNORED_FRIEND_TYPE, IGNORED_FRIEND_TYPE]);
    }

    /**
     * 删除所有标签
     * @returns {boolean}
     */
    function deleteAllLabel() {
        return deleteRows("label_list", null, null);
    }
    
    /**
     * 删除标签
     * @param {String} label
     * @returns {boolean}
     */
    function deleteLabelByLabel(label) {
        return deleteRows("label_list", "label = ?", [label]);
    }

    /**
     * 删除所有好友
     * @returns {boolean} 
     */
    function deleteAllFriend() {
        return deleteRows("friend_list", null, null);
    }

    /**
     * 删除好友
     * @param {String} friend_remark 
     * @returns {boolean} 
     */
    function deleteFriendByFriendRemark(friend_remark) {
        return deleteRows("friend_list", "friend_remark = ?", [friend_remark]);
    }

    /**
     * 所有删除标签、好友联动
     * @returns {boolean} 
     */
    function deleteAllLabelFriend() {
        return deleteRows("label_friend_list", null, null);
    }

    /**
     * 删除标签、好友联动
     * @param {String} label 
     * @returns {boolean} 
     */
    function deleteLabelFriendByLabel(label) {
        return deleteRows("label_friend_list", "label = ?", [label]);
    }

    /**
     * 删除标签、好友联动
     * @param {String} friend_remark 
     * @returns {boolean} 
     */
    function deleteLabelFriendByFriendRemark(friend_remark) {
        return deleteRows("label_friend_list", "friend_remark = ?", [friend_remark]);
    }

    /**
     * 修改已测试的好友
     * @param {TestedFriend} tested_friend 
     * @returns {boolean} 
     */
    function modifyTestedFriend(tested_friend) {
        return modifyRow("tested_friend_list", tested_friend, "we_chat_id");
    }

    /**
     * 修改标签
     * @param {Label} label 
     * @returns {boolean} 
     */
    function modifyLabel(label) {
        return modifyRow("label_list", label, "label");
    }

    /**
     * 修改好友
     * @param {Friend} friend 
     * @returns {boolean} 
     */
    function modifyFriend(friend) {
        return modifyRow("friend_list", friend, "friend_remark");
    }

    /**
     * 标签联动，修改好友
     * @param {Label} label 
     * @returns {boolean} 
     */
    function modifyLabelFriendByLabel(label) {
        return modifyRow("label_friend_list", {enabled: label["enabled"], label: label["label"]}, "label");
    }

    /**
     * 标签联动，修改好友
     * @param {LabelFriend} label_friend 
     * @returns {boolean} 
     */
    function modifyLabelFriend(label_friend) {
        return modifyRow("label_friend_list", label_friend, "friend_remark");
    }

    /**
     * 联动标签
     * @param {String} label 
     */
    function labelFriendLinkageLabel(label) {
        let enabled = countRow("SELECT * FROM label_friend_list WHERE enabled = 'true' AND label = ?", [label], PROPERTY_MAPPING_TYPE_FOR_LABEL) > 0;
        return modifyLabel({label: label, enabled: enabled});
    }

    /**
     * 查找已测试过的好友
     * @param {number} friend_type 
     * @param {int} page 
     * @returns {Array<TestedFriend>}
     */
    function findTestedFriendListByFriendType(friend_type, page) {
        return findRows("SELECT * FROM tested_friend_list WHERE friend_type = ? LIMIT ? OFFSET ?", [friend_type, PAGE_SIZE, (page - 1) * PAGE_SIZE], PROPERTY_MAPPING_TYPE_FOR_TESTED_FRIEND);
    }

    /**
     * 获取异常的好友
     * @returns {Array<TestedFriend>} 
     */
    function findAbnormalFriendList(page) {
        return findTestedFriendListByFriendType(ABNORMAL_FRIEND_TYPE, page || 1);
    }

    /**
     * 获取正常的好友
     * @returns {Array<TestedFriend>} 
     */
    function findNormalFriendList(page) {
        return findTestedFriendListByFriendType(NORMAL_FRIEND_TYPE, page || 1);
    }

    /**
     * 获取忽略测试的好友
     * @returns {Array<TestedFriend>} 
     */
    function findIgnoredTestFriendList(page) {
        return findTestedFriendListByFriendType(IGNORED_FRIEND_TYPE, page || 1);
    }

    /**
     * 查找所有标签
     * @returns {Array<Label>}
     */
    function findAllLabel() {
        return findRows("SELECT label_list.label,COUNT(*) AS count,label_list.enabled FROM label_list JOIN label_friend_list ON label_list.label = label_friend_list.label GROUP BY label_list.label", null, PROPERTY_MAPPING_TYPE_FOR_LABEL);
    }

    /**
     * 通过标签查找好友
     * @param {String} label 
     * @param {int} page 
     * @returns {Array<Friend>}
     */
    function findLabelFriendListByLabel(label, page) {
        return findRows("SELECT * FROM label_friend_list WHERE label = ? LIMIT ? OFFSET ?", [label, PAGE_SIZE, ((page || 1) - 1) * PAGE_SIZE], PROPERTY_MAPPING_TYPE_FOR_LABEL_FRIEND);
    }

    /**
     * 查找好友
     * @param {int} page 
     * @returns {Array<Friend>}
     */
    function findFriendList(page) {
        return findRows("SELECT * FROM friend_list LIMIT ? OFFSET ?", [PAGE_SIZE, ((page || 1) - 1) * PAGE_SIZE], PROPERTY_MAPPING_TYPE_FOR_FRIEND);
    }

    /**
     * 好友已测试过
     * @param {String} friend_remark 好友备注
     * @returns {boolean} 
     */
    function isTestedFriendForFriendRemark(friend_remark) {
        return isExistRow("SELECT * FROM tested_friend_list WHERE friend_remark = ? AND friend_type != ?", [friend_remark, IGNORED_FRIEND_TYPE]);
    }

    /**
     * 好友已测试过
     * @param {String} we_chat_id 微信号
     * @returns {boolean} 
     */
    function isTestedFriendForWeChatID(we_chat_id) {
        return isExistRow("SELECT * FROM tested_friend_list WHERE we_chat_id = ? AND friend_type != ?", [we_chat_id, IGNORED_FRIEND_TYPE]);
    }
    
    /**
     * 标签已存在
     * @param {String} label 标签
     * @returns {boolean} 
     */
    function isExistLabel(label) {
        return isExistRow("SELECT * FROM label_list WHERE label = ?", [label]);
    }

    /**
     * 好友备注已存在
     * @param {String} friend_remark 
     * @returns {boolean} 
     */
    function isExistFriendRemark(friend_remark) {
        return isExistRow("SELECT * FROM friend_list WHERE friend_remark = ?", [friend_remark]);
    }

    /**
     * 标签、好友备注已联动
     * @param {String} friend_remark 
     * @returns {boolean}
     */
    function isExistLabelFriend(friend_remark) {
        return isExistRow("SELECT * FROM label_friend_list WHERE friend_remark = ?", [friend_remark]);
    }

    /**
     * 忽略该备注的好友
     * @param {String} friend_remark 
     * @returns {boolean} 
     */
    function isEnabledForLabelFriendByFriendRemark(friend_remark) {
        return isExistRow("SELECT * FROM label_friend_list WHERE enabled = 'true' AND friend_remark = ?", [friend_remark]);
    }

    /**
     * 忽略该备注的好友
     * @param {String} friend_remark 
     * @returns {boolean} 
     */
    function isEnabledForFriendByFriendRemark(friend_remark) {
        return isExistRow("SELECT * FROM friend_list WHERE enabled = 'true' AND friend_remark = ?", [friend_remark]);
    }

    /**
     * 是否有选中删除好友
     * @param {String} friend_remark 好友备注
     * @returns {boolean} 
     */
    function isSelectedFriendForDeleteByFriendRemark(friend_remark) {
        return isExistRow("SELECT * FROM tested_friend_list WHERE deleted = 'false' AND selected = 'true' AND friend_remark = ? AND friend_type != ?", [friend_remark, IGNORED_FRIEND_TYPE]);
    }
    
    /**
     * 是否有选中好友
     * @param {String} we_chat_id 微信号
     * @returns {boolean} 
     */
    function isSelectedFriendForDeleteByWeChatID(we_chat_id) {
        return isExistRow("SELECT * FROM tested_friend_list WHERE deleted = 'false' AND selected = 'true' AND we_chat_id = ? AND friend_type != ?", [we_chat_id, IGNORED_FRIEND_TYPE]);
    }

    /**
     * 统计待删除的好友
     * @returns {int} 
     */
    function countWaitDeleteFriend() {
        return countRow("SELECT * FROM tested_friend_list WHERE deleted = 'false' AND selected = 'true' AND friend_type != ?", [IGNORED_FRIEND_TYPE]);
    }

    /**
     * 获取已测试的好友页数
     * @param {int} friend_type 
     * @returns {int}
     */
    function getTestedFriendTotalPageByFriendType(friend_type) {
        return getTotalPage("SELECT * FROM tested_friend_list WHERE friend_type = ?", [friend_type]);
    }

    /**
     * 获取好友页数
     * @returns {int}
     */
    function getFriendTotalPage() {
        return getTotalPage("SELECT * FROM friend_list", null);
    }

    /**
     * 获取好友页数
     * @returns {int}
     */
    function getLabelFriendTotalPageByLabel(label) {
        return getTotalPage("SELECT * FROM label_friend_list WHERE label = ?", [label]);
    }

    /**
     * 获取异常的好友页数
     * @returns {int} 
     */
    function getAbnormalFriendTotalPage() {
        return getTestedFriendTotalPageByFriendType(ABNORMAL_FRIEND_TYPE);
    }

    /**
     * 获取正常好友页数
     * @returns {int} 
     */
    function getNormalFriendTotalPage() {
        return getTestedFriendTotalPageByFriendType(NORMAL_FRIEND_TYPE);
    }

    /**
     * 获取忽略测试的好友页数
     * @returns {int} 
     */
    function getIgnoredTestFriendTotalPage() {
        return getTestedFriendTotalPageByFriendType(IGNORED_FRIEND_TYPE);
    }

    function updateDatabase() {
        let base_path = files.cwd();
        files.ensureDir(base_path + "/data/");
        let db = SQLiteDatabase.openOrCreateDatabase(base_path + "/data/we_chat.db", null);

        db.execSQL("CREATE TABLE IF NOT EXISTS tested_friend_list("
        + "we_chat_id VARCHAR(64) PRIMARY KEY,"
        + "friend_remark VARCHAR(128),"
        + "abnormal_message VARCHAR(255),"
        + "selected BOOLEAN,"
        + "deleted BOOLEAN,"
        + "friend_type TINYINT"
        + ")");

        db.execSQL("CREATE TABLE IF NOT EXISTS friend_list("
        + "friend_remark VARCHAR(128) PRIMARY KEY,"
        + "enabled BOOLEAN"
        + ")");

        db.execSQL("CREATE TABLE IF NOT EXISTS label_list("
        + "label VARCHAR(64) PRIMARY KEY,"
        + "count INT,"
        + "enabled BOOLEAN"
        + ")");

        db.execSQL("CREATE TABLE IF NOT EXISTS label_friend_list("
        + "friend_remark VARCHAR(128) PRIMARY KEY,"
        + "label VARCHAR(64),"
        + "enabled BOOLEAN"
        + ")");

        close(db);
    }

    return {
        addTestedFriend: addTestedFriend,
        addLabel: addLabel,
        addFriend: addFriend,
        addLabelFriend: addLabelFriend,
        deleteAllTestedFriend: deleteAllTestedFriend,
        deleteIgnoredTestFriend: deleteIgnoredTestFriend,
        deleteAllLabel: deleteAllLabel,
        deleteLabelByLabel: deleteLabelByLabel,
        deleteAllFriend: deleteAllFriend,
        deleteFriendByFriendRemark: deleteFriendByFriendRemark,
        deleteAllLabelFriend: deleteAllLabelFriend,
        deleteLabelFriendByLabel: deleteLabelFriendByLabel,
        deleteLabelFriendByFriendRemark: deleteLabelFriendByFriendRemark,
        modifyTestedFriend: modifyTestedFriend,
        modifyLabel: modifyLabel,
        modifyLabelFriendByLabel: modifyLabelFriendByLabel,
        modifyLabelFriend: modifyLabelFriend,
        labelFriendLinkageLabel: labelFriendLinkageLabel,
        modifyFriend: modifyFriend,
        findAbnormalFriendList: findAbnormalFriendList,
        findNormalFriendList: findNormalFriendList,
        findIgnoredTestFriendList: findIgnoredTestFriendList,
        findAllLabel: findAllLabel,
        findLabelFriendListByLabel: findLabelFriendListByLabel,
        findFriendList: findFriendList,
        isTestedFriendForFriendRemark: isTestedFriendForFriendRemark,
        isTestedFriendForWeChatID: isTestedFriendForWeChatID,
        isExistLabel: isExistLabel,
        isExistFriendRemark: isExistFriendRemark,
        isExistLabelFriend: isExistLabelFriend,
        isEnabledForLabelFriendByFriendRemark: isEnabledForLabelFriendByFriendRemark,
        isEnabledForFriendByFriendRemark: isEnabledForFriendByFriendRemark,
        isSelectedFriendForDeleteByFriendRemark: isSelectedFriendForDeleteByFriendRemark,
        isSelectedFriendForDeleteByWeChatID: isSelectedFriendForDeleteByWeChatID,
        countWaitDeleteFriend: countWaitDeleteFriend,
        getFriendTotalPage: getFriendTotalPage,
        getLabelFriendTotalPageByLabel: getLabelFriendTotalPageByLabel,
        getAbnormalFriendTotalPage: getAbnormalFriendTotalPage,
        getNormalFriendTotalPage: getNormalFriendTotalPage,
        getIgnoredTestFriendTotalPage: getIgnoredTestFriendTotalPage,
        updateDatabase: updateDatabase,
        ABNORMAL_FRIEND_TYPE: ABNORMAL_FRIEND_TYPE,
        NORMAL_FRIEND_TYPE: NORMAL_FRIEND_TYPE,
        IGNORED_FRIEND_TYPE: IGNORED_FRIEND_TYPE
    };
})();