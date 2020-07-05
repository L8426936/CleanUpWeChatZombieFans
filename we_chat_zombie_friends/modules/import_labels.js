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

    /**
     * 点击通讯录
     */
    function clickContacts() {
        let nodes = id(ids["contacts"]).untilFind();
        for (let i = 0; i < nodes.size(); i++) {
            let node = nodes.get(i);
            if (texts["contacts"].match(node.text()) != null && node_util.backtrackClickNode(node)) {
                step = 1;
                break;
            }
        }
    }

    function clickLabel() {
        step = 0;
        let nodes = id(ids["label_text"]).find();
        for (let i = 0; i < nodes.size(); i++) {
            let node = nodes.get(i);
            if (texts["label"].match(node.text()) != null && node_util.backtrackClickNode(node)) {
                step = 2;
                break;
            }
        }
    }

    /**
     * 滚动好友列表
     */
    function scrollLabelList() {
        if (id(ids["label_list"]).findOne().scrollForward()) {
            sleep(800);
            step = 2;
        } else {
            let label_nodes = id(ids["label"]).untilFind();
            if (label_nodes.size() > 0 && label_nodes.get(label_nodes.size() - 1).text() == last_label && node_util.backtrackClickNode(id(ids["back_to_friend_list"]).findOne())) {
                stopScript();
            }
        }
    }

    function synchronizeLabels() {
        let label_nodes = id(ids["label"]).untilFind();
        for (let i = 0; i < label_nodes.size(); i++) {
            let label = label_nodes.get(i).text();
            if (!db_util.hasLabelWhitelist(label) && !db_util.addLabelWhitelist({label: label, ignored: false})) {
                ui.run(() => {
                    window.import_labels_fail_text.setText(window.import_labels_fail_text.text() + label + "\n");
                    window.import_labels_fail_text_scroll.scrollTo(0, window.import_labels_fail_text.getHeight());
                });
            }
            last_label = label;
        }
        step = 3;
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
        toast(language["script_stopped"]);
        window.close();
        engines.execScriptFile("main.js");
        engines.myEngine().forceStop();
    }

    function main() {
        let config = JSON.parse(files.read("config/config.json"));
        if (launch(config["we_chat_package_name"])) {
            node_util = require("utils/node_util.js");
            db_util = require("utils/db_util.js");
            let app_util = require("utils/app_util.js");

            ids = app_util.weChatIds();
            texts = JSON.parse(files.read("config/text_id/text.json"));

            last_label = "", step = 0, run = true;
            keyDownListenerByVolumeDown();
            
            // 获取系统语言
            language = JSON.parse(files.read("config/languages/" + app_util.localLanguage() + ".json"));

            window = floaty.window(
                <vertical padding="8" bg="#000000">
                    <text textColor="red" id="import_labels_fail_title"/>
                    <scroll h="100" layout_weight="1" id="import_labels_fail_text_scroll"><text textColor="red" layout_gravity="top" id="import_labels_fail_text"/></scroll>
                    <button id="stop_button" textColor="green" style="Widget.AppCompat.Button.Colored" textStyle="bold"/>
                </vertical>
            );
            window.import_labels_fail_title.setText(language["import_labels_fail_title"]);
            window.stop_button.setText(language["stop"]);
            window.setAdjustEnabled(true);
            window.stop_button.on("click", () => {
                stopScript();
            });
    
            while (run) {
                switch (step) {
                    case 0:
                        clickContacts();
                        break;
                    case 1:
                        clickLabel();
                        break;
                    case 2:
                        synchronizeLabels();
                        break;
                    case 3:
                        scrollLabelList();
                        break;
                }
            }
        }
    }

    main();
})();