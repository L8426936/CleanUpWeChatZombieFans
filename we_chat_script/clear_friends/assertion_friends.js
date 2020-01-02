/**
 * 检测微信好友关系
 */
auto();

/**
 * @var abnormal_friends 异常好友
 * @var last_we_chat_name 上一次点击的好友的微信号
 * @var last_friend_nickname 上一次点击的好友的昵称
 * @var last_index 上一次点击的可见好友的位置
 * @var step 执行第几步
 * @var run 运行状态
 */
var abnormal_friends = COMMON.getAbnormalFriends(), last_we_chat_name = "", last_friend_nickname = "", last_index = -1, step = 0, run = false;

/**
 * 启动微信
 */
function launchWeChat() {
    if (launch(CONFIG.WE_CHAT_PACKAGE_NAME)) {
        run = true;
    }
}

/**
 * 点击通讯录
 */
function clickFriends() {
    if (NODE_UTIL.backtrackClickNode(text(CONFIG.FRIENDS_TEXT).findOne())) {
        step = 1;
    }
}

/**
 * 滚动好友列表
 */
function scrollFriends() {
    if(id(CONFIG.FRIEND_LIST_ID).findOne().scrollForward()) {
        last_friend_nickname = "";
        last_index = -1;
        sleep(500);
    }
}

/**
 * 点击好友
 */
function clickFriend() {
    let friend_nicknames = id(CONFIG.FRIEND_NICKNAME_ID).untilFind();
    let index = 0;
    for (let i = 0; i < friend_nicknames.length; i++) {
        if (friend_nicknames[i].text() == last_friend_nickname) {
            index = i + 1;
            break;
        }
    }
    // 跳过连续可见的相同昵称的好友
    while (index <= last_index) {
        index++;
    }
    if (index >= friend_nicknames.length) {
        if (id(CONFIG.FRIEND_COUNT_ID).find().empty()) {
            scrollFriends();
        } else {
            stopScript();
        }
    } else {
        if (NODE_UTIL.backtrackClickNode(friend_nicknames[index])) {
            step = 2;
            last_friend_nickname = friend_nicknames[index].text();
            last_index = index;
        }
    }
}

/**
 * 点击发送信息
 */
function clickSendMessage() {
    let nodes = id(CONFIG.SEND_MESSAGE_ID).untilFind();
    if (nodes.length < 2) {
        if (NODE_UTIL.backtrackClickNode(id(CONFIG.BACK_TO_FRIEND_LIST_ID).findOne())) {
            step = 1;
        }
    } else {
        let we_chat_name = id(CONFIG.WE_CHAT_NAME_ID).findOne().text();
        if (we_chat_name == last_we_chat_name) {
            if (NODE_UTIL.backtrackClickNode(id(CONFIG.BACK_TO_FRIEND_LIST_ID).findOne())) {
                step = 1;
            }
        } else if (NODE_UTIL.backtrackClickNode(nodes[0])) {
            last_we_chat_name = we_chat_name;
            step = 3;
        }
    }
}

/**
 * 点击更多功能
 */
function clickMoreFunction() {
    if (NODE_UTIL.backtrackClickNode(id(CONFIG.MORE_FUNCTION_BY_TRANSFER_MONEY_ID).findOne())) {
        step = 4;
    }
}

/**
 * 点击转账功能
 */
function clickTransferMoney() {
    let nodes = id(CONFIG.TRANSFER_MONEY_FUNCTION_ID).untilFind();
    for (let i = 0; i < nodes.length; i++) {
        if(nodes[i].text() == CONFIG.TRANSFER_MONEY_TEXT) {
            if (NODE_UTIL.backtrackClickNode(nodes[i])) {
                step = 5;
                break;
            }
        }
    }
}

/**
 * 输入转账金额
 */
function setTransferAmount() {
    if (id(CONFIG.TRANSFER_MONEY_ID).findOne().setText("0.01")) {
        step = 6;
    }
}

/**
 * 点击确认转账
 */
function clickConfirmTransferMoney() {
    while (true) {
        if (id(CONFIG.CONFIRM_TRANSFER_MONEY_ID).findOne().clickable()) {
            if (NODE_UTIL.backtrackClickNode(id(CONFIG.CONFIRM_TRANSFER_MONEY_ID).findOne())) {
                step = 7;
                break;
            }
        }
    }
}

/**
 * 判断好友关系
 */
function assertionFriend() {
    // 暂停100毫秒
    sleep(100);
    let node = id(CONFIG.ABNORMAL_MESSAGE_ID).findOnce();
    if (node == null) {
        if (!NODE_UTIL.backtrackClickNode(desc(CONFIG.CLOSE_DESC).findOnce())) {
            assertionFriend();
        } else {
            step = 8;
        }
    } else {
        if (!NODE_UTIL.backtrackClickNode(id(CONFIG.CONFIRM_ABNORMAL_MESSAGE_ID).findOnce())) {
            assertionFriend();
        } else {
            let is_delete = node.text() == "请确认你和他（她）的好友关系是否正常" || node.text() == "你不是收款方好友，对方添加你为好友后才能发起转账";
            abnormal_friends[last_we_chat_name] = {we_chat_name:last_we_chat_name, friend_nickname:last_friend_nickname, assertion:node.text(), is_delete:is_delete};
            step = 8;
        }
    }
}

/**
 * 返回聊天页面
 */
function clickBackToChat() {
    if (NODE_UTIL.backtrackClickNode(id(CONFIG.BACK_TO_CHAT_ID).findOne())) {
        step = 9;
    }
}

/**
 * 返回聊天列表
 */
function clickBackToChatList() {
    if (NODE_UTIL.backtrackClickNode(id(CONFIG.BACK_TO_CHAT_LIST_ID).findOne())) {
        step = 0;
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
        events.onceKeyDown("volume_down", function(event) {
            stopScript();
        });
    });
}

/**
 * 停止脚本运行
 */
function stopScript() {
    run = false;
    COMMON.putAbnormalFriends(abnormal_friends);
    try {
        exit();
    } catch (e) {
    }
    toast("脚本已停止运行！！！");
}

module.exports = {
    main: () => {
        keyDownListenerByVolumeDown();
        launchWeChat();
        while (run) {
            switch(step) {
                case 0:
                    clickFriends();
                    break;
                case 1:
                    clickFriend();
                    break;
                case 2:
                    clickSendMessage();
                    break;
                case 3:
                    clickMoreFunction();
                    break;
                case 4:
                    clickTransferMoney();
                    break;
                case 5:
                    setTransferAmount();
                    break;
                case 6:
                    clickConfirmTransferMoney();
                    break;
                case 7:
                    assertionFriend();
                    break;
                case 8:
                    clickBackToChat();
                    break;
                case 9:
                    clickBackToChatList();
                    break;
            }
        }
    }
}
