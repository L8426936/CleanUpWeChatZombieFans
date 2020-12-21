/**
 * 删除好友
 */

(() => {
    /**
     * 控件id
     */
    let ids;
    /**
     * 控件文本
     */
    let texts;
    let node_util;
    let db_util;
    /**
     * 好友备注
     */
    let last_friend_remark;
    /**
     * 好友的微信号
     */
    let last_we_chat_id;
    /**
     * 上一次点击的可见好友的位置
     */
    let last_index;
    /**
     * 执行步骤
     */
    let step;
    /**
     * 运行状态
     */
    let run;
    /**
     * 悬浮窗
     */
    let window;
    let language;

    /**
     * 点击通讯录
     */
    function clickContacts() {
        if (node_util.backtrackClickNode(id(ids["contacts"]).textMatches(texts["contacts"]).findOne())) {
            step = 1;
        }
    }

    /**
     * 滚动好友列表
     */
    function scrollFriendList() {
        if (node_util.scrollForward(id(ids["friend_list"]).findOne())) {
            last_we_chat_id = "";
            last_friend_remark = "";
            last_index = 0;
            sleep(500);
        }
    }

    /**
     * 点击好友
     */
    function clickFriend() {
        let friend_remark_nodes = id(ids["friend_remark"]).untilFind();
        if (last_index >= friend_remark_nodes.size()) {
            if (id(ids["contacts_count"]).findOnce()) {
                stopScript();
            } else {
                scrollFriendList();
            }
        } else {
            while (last_index < friend_remark_nodes.size()) {
                let friend_remark_node = friend_remark_nodes.get(last_index);
                let friend_remark = friend_remark_node.text();
                if (db_util.isSelectedFriendForDeleteByFriendRemark(friend_remark)) {
                    if (node_util.backtrackClickNode(friend_remark_node)) {
                        last_friend_remark = friend_remark;
                        step = 2;
                        last_index++;
                        break;
                    }
                } else {
                    last_index++;
                }
            }
        }
    }

    /**
    * 检查微信号是否相同
    */
    function checkWeChatId() {
        let we_chat_id = id(ids["we_chat_id"]).findOne().text();
        if (db_util.isSelectedFriendForDeleteByWeChatID(we_chat_id)) {
            last_we_chat_id = we_chat_id;
            step = 3;
        } else if (node_util.backtrackClickNode(id(ids["back_to_friend_list"]).findOne())) {
            step = 1;
        }
    }

    /**
     * 点击更多功能
     */
    function clickMoreFunction() {
        if (node_util.backtrackClickNode(id(ids["more_function_by_delete"]).findOne())) {
            step = 4;
        }
    }

    /**
     * 点击删除功能
     */
    function clickDeleteFunction() {
        if (node_util.backtrackClickNode(id(ids["delete"]).textMatches(texts["delete"]).findOne(200))) {
            step = 5;
        } else {
            node_util.scrollForward(id(ids["more_function_by_delete_list"]).findOnce());
        }
    }

    /**
     * 点击确认删除
     */
    function clickConfirmDelete() {
        if (node_util.backtrackClickNode(id(ids["confirm_delete"]).findOne())) {
            db_util.modifyTestedFriend({we_chat_id: last_we_chat_id, deleted: true});
            db_util.deleteLabelFriendByFriendRemark(last_friend_remark);
            step = 1;
            last_index--;
            ui.run(() => {
                window.deleted_friends_text.setText(window.deleted_friends_text.text() + last_friend_remark + " " + last_we_chat_id + "\n");
                window.deleted_friends_text_scroll.scrollTo(0, window.deleted_friends_text.getHeight());
            });
            return true;
        }
        return false;
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
        });
    }

    /**
     * 停止脚本运行
     */
    function stopScript() {
        run = false;
        events.setKeyInterceptionEnabled("volume_down", false);
        events.removeAllKeyDownListeners("volume_down");
        ui.run(() => window.close());
        toast(language["script_stopped"]);
        engines.execScriptFile("main.js");
        engines.myEngine().forceStop();
    }

    function main() {
        node_util = require("utils/node_util.js");
        db_util = require("utils/db_util.js");
        let app_util = require("utils/app_util.js");

        ids = app_util.getWeChatIds();
        language = app_util.getLanguage();
        texts = JSON.parse(files.read("config/text_id/text.json"));
        
        last_we_chat_id = "", last_friend_remark = "", last_index = 0, step = 0, run = true;
        keyDownListenerByVolumeDown();
        
        window = floaty.window(
            <vertical padding="8" bg="#000000">
                <text textColor="red" id="deleted_friends_title"/>
                <scroll h="100" layout_weight="1" id="deleted_friends_text_scroll"><text textColor="red" layout_gravity="top" id="deleted_friends_text"/></scroll>
                <button id="stop_button" textColor="green" style="Widget.AppCompat.Button.Colored" textStyle="bold"/>
            </vertical>
        );
        ui.run(() => {
            window.deleted_friends_title.setText(language["deleted_friends_title"]);
            window.stop_button.setText(language["stop"]);
            window.setAdjustEnabled(true);
            window.stop_button.on("click", (view) => {
                view.setEnabled(false);
                stopScript();
            });
        });

        launch(app_util.getConfig()["we_chat_package_name"]);
        
        let count_wait_delete_friend = db_util.countWaitDeleteFriend();
        while (run && count_wait_delete_friend > 0) {
            switch (step) {
                case 0:
                    clickContacts();
                    break;
                case 1:
                    clickFriend();
                    break;
                case 2:
                    checkWeChatId();
                    break;
                case 3:
                    clickMoreFunction();
                    break;
                case 4:
                    clickDeleteFunction();
                    break;
                case 5:
                    if (clickConfirmDelete()) {
                        count_wait_delete_friend--;
                    }
                    break;
            }
        }
        if (count_wait_delete_friend == 0) {
            stopScript();
        }
    }

    main();
})();