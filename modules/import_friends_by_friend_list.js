/**
 * 导入好友
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
    let log_util;

    /**
     * 点击通讯录
     */
    function clickContacts() {
        if (node_util.backtrackClickNode(id(ids["contacts"]).textMatches(texts["contacts"]).findOne())) {
            step = 1;
            log_util.info("点击通讯录成功");
        } else {
            log_util.warn("点击通讯录失败");
        }
    }

    /**
     * 滚动好友列表
     */
    function scrollFriendList() {
        let scrollResult = false;
        log_util.log("滚动ListView控件策略1");
        let node = id(ids["friend_list"]).findOnce();
        if (node) {
            if (node.bounds().right - node.bounds().left > 0) {
                scrollResult = node_util.scrollForward(node);
            } else {
                log_util.warn("ListView控件宽度为0");
            }
        } else {
            log_util.error("未找到ListView控件，控件id可能不一致");
        }
        if (!scrollResult) {
            log_util.log("滚动ListView控件策略2");
            let friend_remark_nodes = id(ids["friend_remark"]).untilFind();
            if (friend_remark_nodes.size() > 0) {
                let firstBounds = friend_remark_nodes.get(0).bounds();
                let lastBounds = friend_remark_nodes.get(friend_remark_nodes.size() - 1).bounds();
                scrollResult = swipe(lastBounds.centerX(), lastBounds.centerY(), firstBounds.centerX(), firstBounds.top, 500);
            }
        }
        // 最糟糕的情况，按1080x1920比例滑动屏幕
        if (!scrollResult) {
            log_util.log("滚动ListView控件策略3");
            setScreenMetrics(1080, 1920);
            scrollResult = swipe(540, 1658, 540, 428, 500);
        }
        if (scrollResult) {
            step = 1;
            sleep(500);
            log_util.info("滚动ListView控件成功");
        } else {
            log_util.warn("滚动ListView控件失败");
        }
        log_util.log("----------------------------------------");
    }

    function synchronizeFriends() {
        let friend_remark_nodes = id(ids["friend_remark"]).untilFind();
        for (let i = 0; i < friend_remark_nodes.size(); i++) {
            let friend_remark = friend_remark_nodes.get(i).text();
            if (!(db_util.isExistFriendRemark(friend_remark) || db_util.addLabelFriend({friend_remark: friend_remark, label: "", enabled: false}))) {
                ui.run(() => {
                    window.import_friends_fail_text.setText(window.import_friends_fail_text.text() + friend_remark + "\n");
                    window.import_friends_fail_text_scroll.scrollTo(0, window.import_friends_fail_text.getHeight());
                });
            }
        }
        step = 2;
        if (id(ids["contacts_count"]).findOnce()) {
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
        toastLog(language["script_stopped"]);
        engines.execScriptFile("main.js");
        engines.myEngine().forceStop();
    }

    function main() {
        node_util = require("utils/node_util.js");
        db_util = require("utils/db_util.js");
        log_util = require("utils/log_util.js");
        let app_util = require("utils/app_util.js");
        
        ids = app_util.getWeChatIds();
        texts = JSON.parse(files.read("config/text_id/text.json"));
        
        step = 0, run = true;
        keyDownListenerByVolumeDown();
        
        // 获取系统语言
        language = app_util.getLanguage();

        toastLog(language["script_running"]);
        
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
                    synchronizeFriends();
                    break;
                case 2:
                    scrollFriendList();
                    break;
            }
        }
    }

    main();
})();