/**
 * 删除好友
 */

module.exports = (() => {
    /**
     * @var abnormal_friends 异常好友
     * @var deleted_abnormal_friends 已删除的好友
     * @var last_index 上一次点击的可见好友的位置
     * @var step 执行第几步
     * @var run 运行状态
     */
    let window, abnormal_friends, deleted_abnormal_friends, last_index, step, run;

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
        if (NODE_UTIL.backtrackClickNode(text(CONFIG.COMPONENT.FRIENDS_TEXT).findOne())) {
            run = true;
            return true;
        }
        return false;
    }

    /**
     * 滚动好友列表
     */
    function scrollFriends() {
        if (id(CONFIG.COMPONENT.FRIEND_LIST_ID).findOne().scrollForward()) {
            last_index = -1;
            sleep(800);
        }
    }

    /**
     * 点击好友
     */
    function clickFriend(abnormal_friend) {
        let friends_remark = id(CONFIG.COMPONENT.FRIEND_NICKNAME_ID).untilFind();
        let index = 0;
        for (let i = 0; i < friends_remark.length; i++) {
            if (friends_remark[i].text() == abnormal_friend.friend_remark) {
                index = i;
                break;
            }
        }
        // 跳过连续可见的相同昵称的好友
        while (index <= last_index) {
            index++;
        }
        if (index >= friends_remark.length || friends_remark[index].text() != abnormal_friend.friend_remark) {
            if (id(CONFIG.COMPONENT.FRIEND_COUNT_ID).find().empty()) {
                scrollFriends();
            } else {
                stopScript();
            }
        } else {
            if (NODE_UTIL.backtrackClickNode(friends_remark[index])) {
                step = 1;
                last_index = index;
            }
        }
    }

    /**
    * 检查微信号是否相同
    */
    function checkWeChatName(abnormal_friend) {
        if (id(CONFIG.COMPONENT.WE_CHAT_NAME_ID).findOne().text() == abnormal_friend.we_chat_name) {
            step = 2;
        } else {
            if (NODE_UTIL.backtrackClickNode(id(CONFIG.COMPONENT.BACK_TO_FRIEND_LIST_ID).findOne())) {
                step = 0;
            }
        }
    }

    /**
     * 点击更多功能
     */
    function clickMoreFunction() {
        if (NODE_UTIL.backtrackClickNode(id(CONFIG.COMPONENT.MORE_FUNCTION_BY_DELETE_ID).findOne())) {
            step = 3;
        }
    }

    /**
     * 点击删除功能
     */
    function clickDelete() {
        let nodes = id(CONFIG.COMPONENT.DELETE_ID).untilFind();
        for (let i = 0; i < nodes.length; i++) {
            if (nodes[i].text() == CONFIG.COMPONENT.DELETE_TEXT) {
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
        let nodes = id(CONFIG.COMPONENT.CONFIRM_DELETE_ID).untilFind();
        for (let i = 0; i < nodes.length; i++) {
            if (nodes[i].text() == CONFIG.COMPONENT.DELETE_TEXT) {
                if (NODE_UTIL.backtrackClickNode(nodes[i])) {
                    deleted_abnormal_friends.push(abnormal_friend.we_chat_name);
                    step = 5;
                    last_index--;
                    ui.run(() => {
                        window.deleted_text.setText(window.deleted_text.text() + "备注：" + abnormal_friend.friend_remark + " " + abnormal_friend.we_chat_name + "\n");
                        window.deleted_text_scroll.scrollTo(0, window.deleted_text.getHeight());
                    });
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
        for (let i = 0; i < deleted_abnormal_friends.length; i++) {
            delete abnormal_friends[deleted_abnormal_friends[i]];
        }
        COMMON.putAbnormalFriends(abnormal_friends);
        window.close();
        toast("脚本已停止运行！！！");
    }

    function main() {
        
        window = floaty.window(
            <frame>
                <vertical padding="8" bg="#000000" w="*">
                    <vertical layout_weight="1" w="*">
                        <text textColor="red" w="*">以下微信好友已删除</text>
                        <scroll w="*" h="60" id="deleted_text_scroll"><text textColor="red" layout_gravity="top" id="deleted_text"></text></scroll>
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

        abnormal_friends = COMMON.getAbnormalFriends(), deleted_abnormal_friends = [], last_index = -1, step = 0, run = false;
        keyDownListenerByVolumeDown();
        launchWeChat();
        if (clickFriends()) {
            for (let we_chat_name in abnormal_friends) {
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

    return {main: main};
})();
