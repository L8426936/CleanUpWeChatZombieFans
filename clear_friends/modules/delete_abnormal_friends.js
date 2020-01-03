/**
 * 删除好友
 */

/**
 * @var abnormal_friends 异常好友
 * @var last_we_chat_name 上一次点击的好友的微信号
 * @var last_friend_nickname 上一次点击的好友的昵称
 * @var last_index 上一次点击的可见好友的位置
 */
var abnormal_friends, deleted_abnormal_friends, last_index, step, run;

/**
 * 启动微信
 */
function launchWeChat() {
    if (launch(CONFIG.WE_CHAT_PACKAGE_NAME)) {
    }
}

/**
 * 点击通讯录
 */
function clickFriends() {
    if (NODE_UTIL.backtrackClickNode(text(CONFIG.FRIENDS_TEXT).findOne())) {
        run = true;
        return true;
    }
    return false;
}

/**
 * 滚动好友列表
 */
function scrollFriends() {
    if (id(CONFIG.FRIEND_LIST_ID).findOne().scrollForward()) {
        last_index = -1;
        sleep(500);
    }
}

/**
 * 点击好友
 */
function clickFriend(abnormal_friend) {
    let friend_nicknames = id(CONFIG.FRIEND_NICKNAME_ID).untilFind();
    let index = 0;
    for (let i = 0; i < friend_nicknames.length; i++) {
        if (friend_nicknames[i].text() == abnormal_friend.friend_nickname) {
            index = i;
            break;
        }
    }
    // 跳过连续可见的相同昵称的好友
    while (index <= last_index) {
        index++;
    }
    if (index >= friend_nicknames.length || friend_nicknames[index].text() != abnormal_friend.friend_nickname) {
        if (id(CONFIG.FRIEND_COUNT_ID).find().empty()) {
            scrollFriends();
        } else {
            stopScript();
        }
    } else {
        if (NODE_UTIL.backtrackClickNode(friend_nicknames[index])) {
            step = 1;
            last_index = index;
        }
    }
}

/**
* 检查微信号是否相同
*/
function checkWeChatName(abnormal_friend) {
    if (id(CONFIG.WE_CHAT_NAME_ID).findOne().text() == abnormal_friend.we_chat_name) {
        step = 2;
    } else {
        if (NODE_UTIL.backtrackClickNode(id(CONFIG.BACK_TO_FRIEND_LIST_ID).findOne())) {
            step = 0;
        }
    }
}

/**
 * 点击更多功能
 */
function clickMoreFunction() {
    if (NODE_UTIL.backtrackClickNode(id(CONFIG.MORE_FUNCTION_BY_DELETE_ID).findOne())) {
        step = 3;
    }
}

/**
 * 点击删除功能
 */
function clickDelete() {
    let nodes = id(CONFIG.DELETE_ID).untilFind();
    for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].text() == CONFIG.DELETE_TEXT) {
            if (NODE_UTIL.backtrackClickNode(nodes[i])) {
                step = 4;
                break;
            }
        }
    }
}

/**
 * 点击确认删除
 */
function clickConfirmDelete(abnormal_friend) {
    let nodes = id(CONFIG.CONFIRM_DELETE_ID).untilFind();
    for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].text() == CONFIG.DELETE_TEXT) {
            if (NODE_UTIL.backtrackClickNode(nodes[i])) {
                deleted_abnormal_friends.push(abnormal_friend.we_chat_name);
                step = 5;
                last_index--;
                break;
            }
        }
    }
}

/**
 * 监听音量下键按下，停止脚本运行
 */
function keyDownListenerByVolumeDown() {
    threads.start(function () {
        toast("按下减小音量键停止脚本运行");
        // 启用按键监听
        events.observeKey();
        events.setKeyInterceptionEnabled("volume_down", true);
        // 监听音量上键按下
        events.onceKeyDown("volume_down", function (event) {
            stopScript();
        });
    });
}

/**
 * 停止脚本运行
 */
function stopScript() {
    run = false;
    for (let i = 0; i < deleted_abnormal_friends.length; i++) {
        delete abnormal_friends[deleted_abnormal_friends[i]];
    }
    COMMON.putAbnormalFriends(abnormal_friends);
    events.setKeyInterceptionEnabled("volume_down", false);
    events.removeAllKeyDownListeners("volume_down");
    toast("脚本已停止运行！！！");
}

module.exports = {
    main: () => {
        abnormal_friends = COMMON.getAbnormalFriends(), deleted_abnormal_friends = [], last_index = -1, step = 0, run = false;
        keyDownListenerByVolumeDown();
        launchWeChat();
        if (clickFriends()) {
            for (let we_chat_name of Object.keys(abnormal_friends)) {
                if (abnormal_friends[we_chat_name].is_delete) {
                    deleted:
                    while (run) {
                        switch (step) {
                            case 0:
                                clickFriend(abnormal_friends[we_chat_name]);
                                break;
                            case 1:
                                checkWeChatName(abnormal_friends[we_chat_name]);
                                break;
                            case 2:
                                clickMoreFunction();
                                break;
                            case 3:
                                clickDelete();
                                break;
                            case 4:
                                clickConfirmDelete(abnormal_friends[we_chat_name]);
                                break;
                            case 5:
                                step = 0;
                                break deleted;
                        }
                    }
                }
            }
        }
        stopScript();
    }
}
