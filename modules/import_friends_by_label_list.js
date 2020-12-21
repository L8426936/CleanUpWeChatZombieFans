/**
 * 导入标签
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
     * 悬浮窗
     */
    let window;
    /**
     * 执行步骤
     */
    let step;
    /**
     * 运行状态
     */
    let run;
    let language;
    let last_label;
    let last_index;
    let labels_map;

    /**
     * 点击通讯录
     */
    function clickContacts() {
        if (node_util.backtrackClickNode(id(ids["contacts"]).textMatches(texts["contacts"]).findOne())) {
            step = 1;
        }
    }

    /**
     * 点击标签
     */
    function clickLabels() {
        step = 0;
        if (node_util.backtrackClickNode(id(ids["labels"]).textMatches(texts["label"]).findOnce())) {
            if (id(ids["add_label"]).text(texts["add_label"]).findOne(3000) && node_util.backtrackClickNode(id(ids["back_to_friend_list"]).findOne())) {
                stopScript();
            } else {
                step = 2;
            }
        }
    }

    function clickLabel() {
        let label_nodes = id(ids["label"]).untilFind();
        let count_nodes = id(ids["contacts_count_by_label"]).untilFind();
        if (label_nodes.size() == count_nodes.size() && label_nodes.size() > 0) {
            if (last_index < label_nodes.size()) {
                let label = label_nodes.get(last_index).text();
                let count = count_nodes.get(last_index).text().match(/\d+/);
                if (count > 0 && !labels_map[label]) {
                    if (node_util.backtrackClickNode(label_nodes.get(last_index))) {
                        labels_map[label] = {count: 0};
                        last_label = label;
                        step = 3;
                        last_index++;
                    }
                } else {
                    last_index++;
                }
            } else {
                step = 5;
            }
        }
    }

    function synchronizeFriends() {
        let friend_remark_nodes = id(ids["friend_remark_by_label"]).untilFind();
        for (let i = 0; i < friend_remark_nodes.size(); i++) {
            let friend_remark = friend_remark_nodes.get(i).text();
            let label_friend = db_util.findLabelFriendByFriendRemark(friend_remark);
            let result = false;
            if (label_friend) {
                if (label_friend["label"]) {
                    result = true;
                } else {
                    label_friend["label"] = last_label;
                    result = db_util.modifyLabelFriend(label_friend);
                }
            } else {
                label_friend = {label: last_label, friend_remark: friend_remark, enabled: false};
                result = db_util.addLabelFriend(label_friend);
            }
            if (!result) {
                ui.run(() => {
                    window.import_friends_fail_text.setText(window.import_friends_fail_text.text() + friend_remark + "\n");
                    window.import_friends_fail_text_scroll.scrollTo(0, window.import_friends_fail_text.getHeight());
                });
            }
        }
        if (id(ids["delete_label"]).text(texts["delete_label"]).findOnce() && node_util.backtrackClickNode(id(ids["back_to_label_list"]).findOne())) {
            step = 2;
        } else {
            step = 4;
        }
    }

    /**
     * 滚动好友列表
     */
    function scrollFriendList() {
        if (node_util.scrollForward(id(ids["friend_list_by_label"]).findOne())) {
            step = 3;
            sleep(500);
        }
    }

    /**
     * 滚动标签列表
     */
    function scrollLabelList() {
        if (node_util.scrollForward(id(ids["label_list"]).findOne())) {
            step = 2;
            last_index = 0;
            sleep(500);
        } else if (node_util.backtrackClickNode(id(ids["back_to_friend_list"]).findOne())) {
            stopScript();
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
            // 监听减音量键按下
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
        texts = JSON.parse(files.read("config/text_id/text.json"));

        last_label = "", step = 0, run = true, last_index = 0, labels_map = {};
        let label_list = db_util.findAllLabel();
        for (let i = 0; i < label_list.length; i++) {
            labels_map[label_list[i]["label"]] = label_list[i];
        }
        keyDownListenerByVolumeDown();
        
        // 获取系统语言
        language = app_util.getLanguage();

        window = floaty.window(
            <vertical padding="8" bg="#000000">
                <text textColor="red" id="import_friends_fail_title"/>
                <scroll h="100" layout_weight="1" id="import_friends_fail_text_scroll"><text textColor="red" layout_gravity="top" id="import_friends_fail_text"/></scroll>
                <button id="stop_button" textColor="green" style="Widget.AppCompat.Button.Colored" textStyle="bold"/>
            </vertical>
        );
        ui.run(() => {
            window.import_friends_fail_title.setText(language["import_friends_fail_title"]);
            window.stop_button.setText(language["stop"]);
            window.setAdjustEnabled(true);
            window.stop_button.on("click", (view) => {
                view.setEnabled(false);
                stopScript();
            });
        });
        
        launch(app_util.getConfig()["we_chat_package_name"]);
        while (run) {
            switch (step) {
                case 0:
                    clickContacts();
                    break;
                case 1:
                    clickLabels();
                    break;
                case 2:
                    clickLabel();
                    break;
                case 3:
                    synchronizeFriends();
                    break;
                case 4:
                    scrollFriendList();
                    break;
                case 5:
                    scrollLabelList();
                    break;
            }
        }
    }

    main();
})();