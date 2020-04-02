/**
 * 检测微信好友关系
 */

module.exports = (() => {
    /**
     * @var checked_friends 已检查的好友
     * @var abnormal_friends 异常好友
     * @var last_we_chat_name 上一次点击的好友的微信号
     * @var last_friend_remark 上一次点击的好友的备注
     * @var last_index 上一次点击的可见好友的位置
     * @var step 执行第几步
     * @var run 运行状态
     */
    let window, ignore_friends, checked_friends, abnormal_friends, last_we_chat_name, last_friend_remark, last_index, step, run;

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
        if (NODE_UTIL.backtrackClickNode(text(CONFIG.COMPONENT.FRIENDS_TEXT).findOne())) {
            step = 1;
        }
    }

    /**
     * 滚动好友列表
     */
    function scrollFriends() {
        if(id(CONFIG.COMPONENT.FRIEND_LIST_ID).findOne().scrollForward()) {
            last_friend_remark = "";
            last_index = -1;
            sleep(800);
        }
    }

    /**
     * 点击好友
     */
    function clickFriend() {
        let friends_remark = id(CONFIG.COMPONENT.FRIEND_NICKNAME_ID).untilFind();
        let index = 0;
        for (let i = 0; i < friends_remark.length; i++) {
            if (friends_remark[i].text() == last_friend_remark) {
                index = i + 1;
                break;
            }
        }
        // 跳过连续可见的相同备注的好友
        let skip = false;
        while (index <= last_index) {
            skip = true;
            index++;
        }
        if (index >= friends_remark.length) {
            if (id(CONFIG.COMPONENT.FRIEND_COUNT_ID).find().empty()) {
                scrollFriends();
            } else {
                stopScript();
            }
        } else {
            last_friend_remark = friends_remark[index].text();
            last_index = index;
            if (skip || checked_friends[last_friend_remark] == undefined) {
                if (NODE_UTIL.backtrackClickNode(friends_remark[index])) {
                    step = 2;
                }
            } else {
                step = 1;
                ui.run(() => {
                    window.checked_text.setText(window.checked_text.text() + "备注：" + last_friend_remark + "\n");
                    window.checked_text_scroll.scrollTo(0, window.checked_text.getHeight());
                });
            }
        }
    }

    /**
     * 点击发送信息
     */
    function clickSendMessage() {
        let nodes = id(CONFIG.COMPONENT.SEND_MESSAGE_ID).untilFind();
        if (nodes.length < 2) {
            if (NODE_UTIL.backtrackClickNode(id(CONFIG.COMPONENT.BACK_TO_FRIEND_LIST_ID).findOne())) {
                step = 1;
                ignore_friends[last_friend_remark] = true;
                ui.run(() => {
                    window.warning_text.setText(window.warning_text.text() + "备注：" + last_friend_remark + "\n");
                    window.warning_text_scroll.scrollTo(0, window.warning_text.getHeight());
                });
            }
        } else {
            let we_chat_name = id(CONFIG.COMPONENT.WE_CHAT_NAME_ID).findOne().text();
            let is_not_checked = isNotChecked(we_chat_name);
            if (is_not_checked && NODE_UTIL.backtrackClickNode(nodes[0])) {
                last_we_chat_name = we_chat_name;
                step = 3;
            } else {
                if (NODE_UTIL.backtrackClickNode(id(CONFIG.COMPONENT.BACK_TO_FRIEND_LIST_ID).findOne())) {
                    step = 1;
                }
            }
        }
    }

    /**
     * 该好友未检查过
     */
    function isNotChecked(we_chat_name) {
        return checked_friends[last_friend_remark] == undefined || checked_friends[last_friend_remark][we_chat_name] == undefined;
    }

    /**
     * 点击更多功能
     */
    function clickMoreFunction() {
        if (NODE_UTIL.backtrackClickNode(id(CONFIG.COMPONENT.MORE_FUNCTION_BY_TRANSFER_MONEY_ID).findOne())) {
            step = 4;
        }
    }

    /**
     * 点击转账功能
     */
    function clickTransferMoney() {
        let nodes = id(CONFIG.COMPONENT.TRANSFER_MONEY_FUNCTION_ID).untilFind();
        for (let i = 0; i < nodes.length; i++) {
            if(nodes[i].text() == CONFIG.COMPONENT.TRANSFER_MONEY_TEXT) {
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
        if (id(CONFIG.COMPONENT.TRANSFER_MONEY_ID).findOne().setText("0.01")) {
            step = 6;
        }
    }

    /**
     * 点击确认转账
     */
    function clickConfirmTransferMoney() {
        while (true) {
            if (id(CONFIG.COMPONENT.CONFIRM_TRANSFER_MONEY_ID).findOne().clickable()) {
                if (NODE_UTIL.backtrackClickNode(id(CONFIG.COMPONENT.CONFIRM_TRANSFER_MONEY_ID).findOne())) {
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
        while (true) {
            let node = id(CONFIG.COMPONENT.ABNORMAL_MESSAGE_ID).findOne(300);
            if (node == null) {
                if (NODE_UTIL.backtrackClickNode(desc(CONFIG.COMPONENT.CLOSE_DESC_TEXT).findOnce())) {
                    step = 8;
                    break;
                }
            } else {
                if (NODE_UTIL.backtrackClickNode(id(CONFIG.COMPONENT.CONFIRM_ABNORMAL_MESSAGE_ID).findOnce())) {
                    let is_delete = node.text() == "请确认你和他（她）的好友关系是否正常" || node.text() == "你不是收款方好友，对方添加你为好友后才能发起转账";
                    abnormal_friends[last_we_chat_name] = {we_chat_name:last_we_chat_name, friend_remark:last_friend_remark, assertion:node.text(), is_delete:is_delete};
                    step = 8;
                    break;
                }
            }
        }
        checked_friends[last_friend_remark] = checked_friends[last_friend_remark] || {};
        checked_friends[last_friend_remark][last_we_chat_name] = true;
        ui.run(() => {
            window.checked_text.setText(window.checked_text.text() + "备注：" + last_friend_remark + " " + last_we_chat_name + "\n");
            window.checked_text_scroll.scrollTo(0, window.checked_text.getHeight());
        });
    }

    /**
     * 返回聊天页面
     */
    function clickBackToChat() {
        if (NODE_UTIL.backtrackClickNode(id(CONFIG.COMPONENT.BACK_TO_CHAT_ID).findOne())) {
            step = 9;
        }
    }

    /**
     * 返回聊天列表
     */
    function clickBackToChatList() {
        if (NODE_UTIL.backtrackClickNode(id(CONFIG.COMPONENT.BACK_TO_CHAT_LIST_ID).findOne())) {
            step = 0;
        }
    }

    /**
     * 监听音量下键按下，停止脚本运行
     */
    function keyDownListenerByVolumeDown() {
        threads.start(function () {
            // 启用按键监听
            events.observeKey();
            events.setKeyInterceptionEnabled("volume_down", true);
            // 监听音量上键按下
            events.onceKeyDown("volume_down", function () {
                stopScript();
            });
            toast("按下降低音量键停止脚本运行");
        });
    }

    /**
     * 停止脚本运行
     */
    function stopScript() {
        run = false;
        COMMON.putAbnormalFriends(abnormal_friends);
        COMMON.putCheckedFriends(checked_friends);
        COMMON.putIgnoreFriends(ignore_friends);
        events.setKeyInterceptionEnabled("volume_down", false);
        events.removeAllKeyDownListeners("volume_down");
        toast("脚本已停止运行！！！");
        window.close();
    }
    
    function main() {

        window = floaty.window(
            <frame>
                <vertical padding="8" bg="#000000" w="*">
                    <vertical layout_weight="1" w="*">
                        <vertical layout_weight="1" w="*">
                            <text textColor="#FF8000" w="*">本次运行以下微信好友漏查或是无需检查</text>
                            <scroll w="*" h="60" id="warning_text_scroll"><text textColor="#FF8000" layout_gravity="top" id="warning_text"></text></scroll>
                        </vertical>
                        <vertical layout_weight="1" w="*">
                            <text textColor="green" w="*">以下微信好友已检查</text>
                            <scroll w="*" h="60" id="checked_text_scroll"><text textColor="green" layout_gravity="top" id="checked_text"></text></scroll>
                        </vertical>
                    </vertical>
                    <horizontal>
                        <button id="stop_button" w="*" textColor="green" style="Widget.AppCompat.Button.Colored" textStyle="bold" text="停止"/>
                    </horizontal>
                </vertical>
            </frame>
        );
        
        window.setAdjustEnabled(true);

        window.stop_button.on("click", () => {
            stopScript();
        });

        ignore_friends = {}, checked_friends = COMMON.getCheckedFriends(), abnormal_friends = COMMON.getAbnormalFriends(), last_we_chat_name = "", last_friend_remark = "", last_index = -1, step = 0, run = false;
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

    return {main: main};
})();
