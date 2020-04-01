/**
 * 以下控件id适用微信7.0.9~7.0.12版本
 */
module.exports = (() => {
    // 微信包名
    const WE_CHAT_PACKAGE_NAME = "com.tencent.mm",
    STORAGES_FILE_KEY = "com.niming:we_chat_tool",
    ABNORMAL_FRIENDS_KEY = "abnormal_friends",
    CHECKED_FRIENDS_KEY = "checked_friends",
    IGNORE_FRIENDS_KEY = "ignore_friends",
    MIN_SUPPORTED_WE_CHAT_VERSION = "7.0.9",
    MAX_SUPPORTED_WE_CHAT_VERSION = "7.0.12";

    function getComponent() {
        let components = {
            "7.0.9~7.0.11": {
                FRIENDS_TEXT: "通讯录",
                DELETE_TEXT: "删除",
                CLOSE_DESC_TEXT: "关闭",
                TRANSFER_MONEY_TEXT: "转账",
                // 通讯录的联系人ListView的id
                FRIEND_LIST_ID: "oc",
                // 通讯录的联系人的昵称的id
                FRIEND_NICKNAME_ID: "pa",
                // 通讯录的联系人列表底部的联系人数量的id
                FRIEND_COUNT_ID: "b5o",
                // 联系人详情页面的“发消息”id
                SEND_MESSAGE_ID: "d9",
                // 联系人详情页面的“微信号”id
                WE_CHAT_NAME_ID: "b_0",
                // 返回通讯录按钮的id
                BACK_TO_FRIEND_LIST_ID: "m1",
                // 聊天页面更多功能按钮的id
                MORE_FUNCTION_BY_TRANSFER_MONEY_ID: "aqk",
                // 转账功能的“转账”的id
                TRANSFER_MONEY_FUNCTION_ID: "zr",
                // 转账金额输入框的id
                TRANSFER_MONEY_ID: "dm",
                // 转账按钮的id
                CONFIRM_TRANSFER_MONEY_ID: "g61",
                // 转账失败提示信息的id
                ABNORMAL_MESSAGE_ID: "djx",
                // 转账失败确认按钮的id
                CONFIRM_ABNORMAL_MESSAGE_ID: "b49",
                // 返回聊天页面按钮的id
                BACK_TO_CHAT_ID: "m1",
                // 返回聊天列表页面按钮的id
                BACK_TO_CHAT_LIST_ID: "ls",
                // 好友页面更多功能按钮的id
                MORE_FUNCTION_BY_DELETE_ID: "lo",
                // 删除功能的“删除”的id
                DELETE_ID: "dd",
                // 确认删除按钮的id
                CONFIRM_DELETE_ID: "b49"
            },
            "7.0.12~7.0.12": {
                FRIENDS_TEXT: "通讯录",
                DELETE_TEXT: "删除",
                CLOSE_DESC_TEXT: "关闭",
                TRANSFER_MONEY_TEXT: "转账",
                // 通讯录的联系人ListView的id
                FRIEND_LIST_ID: "f3",
                // 通讯录的联系人的昵称的id
                FRIEND_NICKNAME_ID: "drt",
                // 通讯录的联系人列表底部的联系人数量的id
                FRIEND_COUNT_ID: "awg",
                // 联系人详情页面的“发消息”id
                SEND_MESSAGE_ID: "fwd",
                // 联系人详情页面的“微信号”id
                WE_CHAT_NAME_ID: "azk",
                // 返回通讯录按钮的id
                BACK_TO_FRIEND_LIST_ID: "dn",
                // 聊天页面更多功能按钮的id
                MORE_FUNCTION_BY_TRANSFER_MONEY_ID: "aja",
                // 转账功能的“转账”的id
                TRANSFER_MONEY_FUNCTION_ID: "p6",
                // 转账金额输入框的id
                TRANSFER_MONEY_ID: "glb",
                // 转账按钮的id
                CONFIRM_TRANSFER_MONEY_ID: "csd",
                // 转账失败提示信息的id
                ABNORMAL_MESSAGE_ID: "diz",
                // 转账失败确认按钮的id
                CONFIRM_ABNORMAL_MESSAGE_ID: "dj6",
                // 返回聊天页面按钮的id
                BACK_TO_CHAT_ID: "dn",
                // 返回聊天列表页面按钮的id
                BACK_TO_CHAT_LIST_ID: "rj",
                // 好友页面更多功能按钮的id
                MORE_FUNCTION_BY_DELETE_ID: "cj",
                // 删除功能的“删除”的id
                DELETE_ID: "g1l",
                // 确认删除按钮的id
                CONFIRM_DELETE_ID: "dj6"
            },
        }
        let app_util = require("./utils/app_util.js");
        let current_version = app_util.getAppVersion(WE_CHAT_PACKAGE_NAME).match(/\d+/g);
        for (let key in components) {
            let version_ranges = key.split("~");
            let min_supported_version = version_ranges[0].match(/\d+/g);
            let max_supported_version = version_ranges[1].match(/\d+/g);

            let min_le_middle = middle_le_max = true;
            for (let j = 0; j < min_supported_version.length || j < current_version.length; j++) {
                let min = j < min_supported_version.length ? parseInt(min_supported_version[j]) : 0;
                let middle = j < current_version.length ? parseInt(current_version[j]) : 0;
                if (min < middle) {
                    break;
                } else if (min > middle) {
                    min_le_middle = false;
                    break;
                }
            }
            for (let j = 0; j < current_version.length || j < max_supported_version.length; j++) {
                let middle = j < current_version.length ? parseInt(current_version[j]) : 0;
                let max = j < max_supported_version.length ? parseInt(max_supported_version[j]) : 0;
                if (middle < max) {
                    break;
                } else if (middle > max) {
                    middle_le_max = false;
                    break;
                }
            }
            if (min_le_middle && middle_le_max) {
                return components[key];
            }
        }
    }

    return {
        WE_CHAT_PACKAGE_NAME: WE_CHAT_PACKAGE_NAME,
        STORAGES_FILE_KEY: STORAGES_FILE_KEY,
        ABNORMAL_FRIENDS_KEY: ABNORMAL_FRIENDS_KEY,
        CHECKED_FRIENDS_KEY: CHECKED_FRIENDS_KEY,
        IGNORE_FRIENDS_KEY: IGNORE_FRIENDS_KEY,
        MIN_SUPPORTED_WE_CHAT_VERSION: MIN_SUPPORTED_WE_CHAT_VERSION,
        MAX_SUPPORTED_WE_CHAT_VERSION: MAX_SUPPORTED_WE_CHAT_VERSION,
        COMPONENT: getComponent()
    };
})();