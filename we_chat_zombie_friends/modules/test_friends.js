/**
 * 检测微信好友关系
 */

module.exports = (() => {
    /**
     * 控件id
     */
    let ids;
    /**
     * 控件文本
     */
    let texts;
    let node_util;
    /**
     * 忽略测试的好友
     */
    let ignored_friends;
    /**
     * 悬浮窗
     */
    let window;
    /**
     * 正常好友
     */
    let normal_friends;
    /**
     * 异常好友
     */
    let abnormal_friends;
    /**
     * 好友的微信号
     */
    let last_we_chat_id;
    /**
     * 好友备注
     */
    let last_friend_remark;
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
    let language;

    /**
     * 点击通讯录
     */
    function clickContacts() {
        let nodes = id(ids["contacts_id"]).untilFind();
        for (let i = 0; i < nodes.size(); i++) {
            let node = nodes.get(i);
            if (texts["contacts_text"].match(node.text()) != null && node_util.backtrackClickNode(node)) {
                step = 1;
                break;
            }
        }
    }

    /**
     * 滚动好友列表
     */
    function scrollFriendList() {
        if (id(ids["friend_list_id"]).findOne().scrollForward()) {
            last_we_chat_id = "";
            last_friend_remark = "";
            last_index = -1;
            sleep(800);
        }
    }

    /**
     * 点击好友
     */
    function clickFriend() {
        let friends_remark = id(ids["friend_remark_id"]).untilFind();
        let index = 0;
        for (let i = 0; i < friends_remark.size(); i++) {
            if (friends_remark.get(i).text() == last_friend_remark) {
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
        if (index >= friends_remark.size()) {
            if (id(ids["contacts_count_id"]).find().empty()) {
                scrollFriendList();
            } else {
                stopScript();
            }
        } else {
            last_friend_remark = friends_remark.get(index).text();
            last_index = index;
            if ((skip || (normal_friends[last_friend_remark] == undefined && abnormal_friends[last_friend_remark] == undefined)) && node_util.backtrackClickNode(friends_remark.get(index))) {
                step = 2;
            } else {
                step = 1;
                ui.run(() => {
                    window.tested_friends_text.setText(window.tested_friends_text.text() + last_friend_remark + "\n");
                    window.tested_friends_scroll.scrollTo(0, window.tested_friends_text.getHeight());
                });
            }
        }
    }

    /**
     * 点击发送信息
     */
    function clickSendMessage() {
        let nodes = id(ids["send_message_id"]).untilFind();
        if (nodes.size() < 2) {
            if (node_util.backtrackClickNode(id(ids["back_to_friend_list_id"]).findOne())) {
                step = 1;
                ignored_friends[last_friend_remark] = true;
                ui.run(() => {
                    window.ignored_friends_text.setText(window.ignored_friends_text.text() + last_friend_remark + "\n");
                    window.ignored_friends_scroll.scrollTo(0, window.ignored_friends_text.getHeight());
                });
            }
        } else {
            let we_chat_id = id(ids["we_chat_id"]).findOne().text();
            if ((normal_friends[last_friend_remark] == undefined || normal_friends[last_friend_remark][we_chat_id] == undefined) && (abnormal_friends[last_friend_remark] == undefined || abnormal_friends[last_friend_remark][we_chat_id] == undefined)) {
                for (let i = 0; i < nodes.size(); i++) {
                    let node = nodes.get(i);
                    if (texts["send_message_text"].match(node.text()) != null && node_util.backtrackClickNode(node)) {
                        last_we_chat_id = we_chat_id;
                        step = 3;
                        break;
                    }
                }
            } else if (node_util.backtrackClickNode(id(ids["back_to_friend_list_id"]).findOne())) {
                step = 1;
            }
        }
    }

    /**
     * 点击更多功能
     */
    function clickMoreFunction() {
        if (node_util.backtrackClickNode(id(ids["more_function_by_transfer_id"]).findOne())) {
            step = 4;
        }
    }

    /**
     * 点击转账功能
     */
    function clickTransferFunction() {
        let nodes = id(ids["transfer_function_id"]).untilFind();
        for (let i = 0; i < nodes.size(); i++) {
            let node = nodes.get(i);
            if (texts["transfer_text"].match(node.text()) && node_util.backtrackClickNode(node)) {
                step = 5;
                break;
            }
        }
    }

    /**
     * 输入转账金额
     */
    function setTransferAmount() {
        if (id(ids["transfer_amount_id"]).findOne().setText("0.01")) {
            step = 6;
        }
    }

    /**
     * 点击确认转账
     */
    function clickConfirmTransfer() {
        if (node_util.backtrackClickNode(id(ids["confirm_transfer_id"]).enabled().findOne())) {
            step = 7;
        }
    }

    /**
     * 判断好友关系
     */
    function assertionFriend() {
        while (true) {
            let node = id(ids["abnormal_message_id"]).findOne(500);
            if (node == null && node_util.backtrackClickNode(descMatches(texts["close_text"]).findOnce())) {
                normal_friends[last_friend_remark] = normal_friends[last_friend_remark] || {};
                normal_friends[last_friend_remark][last_we_chat_id] = { we_chat_id: last_we_chat_id, friend_remark: last_friend_remark, selected: false, deleted: false };
                step = 8;
                break;
            } else if (node_util.backtrackClickNode(id(ids["confirm_abnormal_message_id"]).findOnce())) {
                let selected = texts["blacklisted_message"].match(node.text()) != null || texts["deleted_message"].match(node.text()) != null;
                abnormal_friends[last_friend_remark] = abnormal_friends[last_friend_remark] || {};
                abnormal_friends[last_friend_remark][last_we_chat_id] = { we_chat_id: last_we_chat_id, friend_remark: last_friend_remark, abnormal_message: node.text(), selected: selected, deleted: false };
                step = 8;
                break;
            }
        }
        ui.run(() => {
            window.tested_friends_text.setText(window.tested_friends_text.text() + last_friend_remark + " " + last_we_chat_id + "\n");
            window.tested_friends_scroll.scrollTo(0, window.tested_friends_text.getHeight());
        });
    }

    /**
     * 返回聊天页面
     */
    function clickBackToChat() {
        if (node_util.backtrackClickNode(id(ids["back_to_chat_id"]).findOne())) {
            step = 9;
        }
    }

    /**
     * 返回聊天列表
     */
    function clickBackToChats() {
        if (node_util.backtrackClickNode(id(ids["back_to_chats_id"]).findOne())) {
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
        files.ensureDir("./data/");
        files.write("./data/abnormal_friends.json", JSON.stringify(abnormal_friends));
        files.write("./data/normal_friends.json", JSON.stringify(normal_friends));
        files.write("./data/ignored_friends.json", JSON.stringify(ignored_friends));
        events.setKeyInterceptionEnabled("volume_down", false);
        events.removeAllKeyDownListeners("volume_down");
        toast(language["script_stopped"]);
        window.close();
    }

    function main() {
        let config = JSON.parse(open("./config/config.json").read());
        if (launch(config["we_chat_package_name"])) {
            texts = JSON.parse(open("./config/text_id/text.json").read());
            node_util = require("../utils/node_util.js");
    
            let app_util = require("../utils/app_util.js");
            let min_supported_version, max_supported_version;
            let we_chat_version = app_util.getAppVersion(config["we_chat_package_name"]);
            for (let i = 0; i < config["supported_version"].length; i++) {
                if (app_util.supported(we_chat_version, config["supported_version"][i]["min_supported_version"], config["supported_version"][i]["max_supported_version"])) {
                    min_supported_version = config["supported_version"][i]["min_supported_version"];
                    max_supported_version = config["supported_version"][i]["max_supported_version"];
                    break;
                }
            }
            ids = JSON.parse(open("./config/text_id/" + min_supported_version + "-" + max_supported_version + ".json").read());
    
            normal_friends = files.exists("./data/normal_friends.json") ? JSON.parse(open("./data/normal_friends.json").read()) : {};
            abnormal_friends = files.exists("./data/abnormal_friends.json") ? JSON.parse(open("./data/abnormal_friends.json").read()) : {};
            
            last_we_chat_id = "", last_friend_remark = "", last_index = -1, step = 0, run = true, ignored_friends = {};
            keyDownListenerByVolumeDown();
            
            // 获取系统语言
            let default_language = "zh-CN";
            let local_language = context.resources.configuration.locale.language + "-" + context.resources.configuration.locale.country;
            for (let i = 0; i < config["supported_language"].length; i++) {
                if (config["supported_language"][i] == local_language) {
                    default_language = local_language;
                    break;
                }
            }
            language = JSON.parse(open("./config/languages/" + default_language + ".json").read());

            window = floaty.window(
                <frame>
                    <vertical padding="8" bg="#000000" w="*">
                        <vertical layout_weight="1" w="*">
                            <vertical layout_weight="1" w="*">
                                <text textColor="#FF8000" w="*" id="ignored_friends_title"/>
                                <scroll w="*" h="60" id="ignored_friends_scroll"><text textColor="#FF8000" layout_gravity="top" id="ignored_friends_text"/></scroll>
                            </vertical>
                            <vertical layout_weight="1" w="*">
                                <text textColor="green" w="*" id="tested_friends_title"/>
                                <scroll w="*" h="60" id="tested_friends_scroll"><text textColor="green" layout_gravity="top" id="tested_friends_text"/></scroll>
                            </vertical>
                        </vertical>
                        <horizontal>
                            <button id="stop_button" w="*" textColor="green" style="Widget.AppCompat.Button.Colored" textStyle="bold"/>
                        </horizontal>
                    </vertical>
                </frame>
            );
            window.ignored_friends_title.setText(language["ignored_friends_title"]);
            window.tested_friends_title.setText(language["tested_friends_title"]);
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
                        clickFriend();
                        break;
                    case 2:
                        clickSendMessage();
                        break;
                    case 3:
                        clickMoreFunction();
                        break;
                    case 4:
                        clickTransferFunction();
                        break;
                    case 5:
                        setTransferAmount();
                        break;
                    case 6:
                        clickConfirmTransfer();
                        break;
                    case 7:
                        assertionFriend();
                        break;
                    case 8:
                        clickBackToChat();
                        break;
                    case 9:
                        clickBackToChats();
                        break;
                }
            }
        }
    }

    return { main: main };
})();
