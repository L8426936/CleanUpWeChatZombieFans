/**
 * 检测微信好友关系
 */

(() => {
    let node_util;
    let db_util;
    let app_util;
    let log_util;
    /**
     * 控件id
     */
    let ids;
    /**
     * 控件文本
     */
    let texts;
    let language;
    let running_config;
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
     * 运行状态
     */
    let run;
    let stuck;
    let accumulator;

    function findContactsNode() {
        let node = idMatches(ids["contacts"]).textMatches(texts["contacts"]).findOne(running_config["find_delay_duration"]);
        if (!node) {
            log_util.warn("通讯录控件id可能不一致");
        }
        return node;
    }

    /**
     * 点击通讯录
     */
    function clickContacts() {
        while (true) {
            if (idMatches(ids["friend_list"]).visibleToUser(true).findOnce()) {
                break;
            }
            let node = findContactsNode();
            if (running_config["test_friends"]["clickContacts"]["widget"]) {
                if (node_util.backtrackClickNode(node)) {
                    log_util.debug("控件点击通讯录成功");
                    break;
                }
                log_util.error("控件点击通讯录失败");
            }
            if (running_config["test_friends"]["clickContacts"]["coordinate"]) {
                if (node_util.backtrackSimulationClickNode(node)) {
                    log_util.debug("坐标点击通讯录成功");
                    break;
                }
                log_util.error("坐标点击通讯录失败");
            }
        }
        return clickFriend;
    }

    /**
     * 点击好友
     */
    function clickFriend() {
        let friend_remark_nodes, friend_list_node = idMatches(ids["friend_list"]).visibleToUser(true).findOne(running_config["find_delay_duration"]);
        if (friend_list_node) {
            friend_remark_nodes = friend_list_node.find(idMatches(ids["friend_remark"]));
        } else {
            friend_remark_nodes = idMatches(ids["friend_remark"]).visibleToUser(true).find();
            log_util.warn("联系人列表控件id可能不一致");
        }
        if (!friend_remark_nodes.size()) {
            log_util.warn("好友备注控件id可能不一致");
        }
        while (last_index < friend_remark_nodes.size()) {
            last_friend_remark = friend_remark_nodes.get(last_index).text();
            let repeat_friend_remark = (last_index > 0 && friend_remark_nodes.get(last_index - 1).text() == last_friend_remark) || (last_index < friend_remark_nodes.size() - 1 && friend_remark_nodes.get(last_index + 1).text() == last_friend_remark);
            if (repeat_friend_remark || !db_util.isTestedFriendForFriendRemark(last_friend_remark)) {
                let enabled = true;
                switch (running_config["test_friend_mode"]) {
                    // 白名单模式
                    case 0:
                        enabled = !db_util.isEnabledForLabelFriendByFriendRemark(last_friend_remark);
                        break;
                    // 黑名单模式
                    case 1:
                        enabled = db_util.isEnabledForLabelFriendByFriendRemark(last_friend_remark);
                        break;
                }
                if (enabled) {
                    break;
                }
            }
            last_index++;
            log_util.trace("忽略检测联系人");
        }
        if (last_index >= friend_remark_nodes.size()) {
            let node = idMatches(ids["contacts_count"]).findOnce();
            if (!node) {
                log_util.warn("好友数量控件id可能不一致");
            }
            return node ? stopScript : scrollFriendList;
        }
        while (true) {
            if (running_config["test_friends"]["clickFriend"]["widget"]) {
                if (node_util.backtrackClickNode(friend_remark_nodes.get(last_index))) {
                    log_util.debug("控件点击联系人成功");
                    break;
                }
                log_util.error("控件点击联系人失败");
            }
            if (running_config["test_friends"]["clickFriend"]["coordinate"]) {
                if (node_util.backtrackSimulationClickNode(friend_remark_nodes.get(last_index))) {
                    log_util.debug("坐标点击联系人成功");
                    break;
                }
                log_util.error("坐标点击联系人失败");
            }
        }
        last_index++;
        last_we_chat_id = null;
        return checkContinueTest;
    }

    /**
     * 跳过检测
     */
    function checkContinueTest() {
        if (last_we_chat_id) {
            return clickSendMessage;
        }
        if (!idMatches(ids["more_function_by_delete"]).findOne(running_config["find_delay_duration"])) {
            log_util.debug("忽略检测联系人");
            db_util.addTestedFriend({ we_chat_id: last_friend_remark, friend_remark: last_friend_remark, abnormal_message: '', selected: false, deleted: false, friend_type: db_util.IGNORED_FRIEND_TYPE });
            return backToFriendList;
        }
        let we_chat_id_node = idMatches(ids["we_chat_id"]).findOne(running_config["find_delay_duration"]);
        if (we_chat_id_node) {
            last_we_chat_id = we_chat_id_node.text();
            let account_deleted_node = idMatches(ids["account_deleted"]).findOnce();
            if (account_deleted_node) {
                db_util.addTestedFriend({ we_chat_id: last_we_chat_id, friend_remark: last_friend_remark, abnormal_message: account_deleted_node.text(), selected: true, deleted: false, friend_type: db_util.ABNORMAL_FRIEND_TYPE });
                log_util.debug("微信号已注销");
                return backToFriendList;
            }
            if (db_util.isTestedFriendForWeChatID(last_we_chat_id)) {
                db_util.modifyTestedFriend({ we_chat_id: last_we_chat_id, friend_remark: last_friend_remark });
                log_util.debug("联系人已检测");
                return backToFriendList;
            }
            return clickSendMessage;
        }
        log_util.warn("微信号控件id可能不一致");
        return scrollFriendDetailsPage;
    }

    /**
     * 点击发送信息
     */
    function clickSendMessage() {
        let node = idMatches(ids["send_message"]).textMatches(texts["send_message"]).findOne(running_config["find_delay_duration"]);
        while (node) {
            if (running_config["test_friends"]["clickSendMessage"]["widget"]) {
                if (node_util.backtrackClickNode(node)) {
                    log_util.debug("控件点击发消息成功");
                    return clickSwitchToVoiceMessage;
                }
                log_util.error("控件点击发消息失败");
            }
            if (running_config["test_friends"]["clickSendMessage"]["coordinate"]) {
                if (node_util.backtrackSimulationClickNode(node)) {
                    log_util.debug("坐标点击发消息成功");
                    return clickSwitchToVoiceMessage;
                }
                log_util.error("坐标点击发消息失败");
            }
        }
        log_util.warn("发消息控件id可能不一致");
        return scrollFriendDetailsPage;
    }

    /**
     * 滚动联系人详情页
     */
    function scrollFriendDetailsPage() {
        while (true) {
            if (running_config["test_friends"]["scrollFriendDetailsPage"]["widget"]) {
                // 控件滚动联系人详情页
                let node = idMatches(ids["friend_details_page_list"]).findOne(running_config["find_delay_duration"]);
                if (node) {
                    if (node.bounds().left == node.bounds().right) {
                        log_util.warn("联系人详情页控件宽度为0");
                    }
                    if (node_util.scrollForward(node)) {
                        log_util.debug("控件滚动联系人详情页成功");
                        break;
                    }
                    log_util.error("控件滚动联系人详情页失败");
                } else {
                    log_util.warn("联系人详情页控件id可能不一致");
                }
            }
            if (running_config["test_friends"]["scrollFriendDetailsPage"]["coordinate"]) {
                // 坐标滚动联系人详情页
                setScreenMetrics(1080, 1920);
                if (swipe(540, 1658, 540, 428, running_config["click_delay_duration"])) {
                    log_util.debug("坐标滚动联系人详情页成功");
                    break;
                }
                log_util.error("坐标滚动联系人详情页失败");
            }
        }
        return checkContinueTest;
    }

    /**
     * 切换到语音消息
     */
    function clickSwitchToVoiceMessage() {
        while (true) {
            let node = idMatches(ids["switch_message_type"]).findOne(running_config["find_delay_duration"]);
            if (node) {
                if (texts["switch_to_text_message"].match(node.getContentDescription())) {
                    break;
                }
                if (running_config["test_friends"]["clickSwitchToVoiceMessage"]["widget"]) {
                    if (node_util.backtrackClickNode(node)) {
                        log_util.debug("控件点击切换消息类型成功");
                        break;
                    }
                    log_util.error("控件点击切换消息类型失败");
                }
                if (running_config["test_friends"]["clickSwitchToVoiceMessage"]["coordinate"]) {
                    if (node_util.backtrackSimulationClickNode(node)) {
                        log_util.debug("坐标点击切换消息类型成功");
                        break;
                    }
                    log_util.error("坐标点击切换消息类型失败");
                }
                log_util.debug("node.getContentDescription(): " + node.getContentDescription());
            }
            log_util.warn("切换消息控件id可能不一致");
        }
        return clickMoreFunction;
    }

    /**
     * 点击更多功能
     */
    function clickMoreFunction() {
        while (true) {
            let node = idMatches(ids["more_function_by_transfer"]).findOne(running_config["find_delay_duration"]);
            if (running_config["test_friends"]["clickMoreFunction"]["widget"]) {
                if (node_util.backtrackClickNode(node)) {
                    log_util.debug("控件点击更多功能成功");
                    break;
                }
                log_util.error("控件点击更多功能失败");
            }
            if (running_config["test_friends"]["clickMoreFunction"]["coordinate"]) {
                if (node_util.backtrackSimulationClickNode(node)) {
                    log_util.debug("坐标点击更多功能成功");
                    break;
                }
                log_util.error("坐标点击更多功能失败");
            }
            log_util.warn("更多功能控件id可能不一致");
        }
        return clickTransferFunction;
    }

    /**
     * 点击转账功能
     */
    function clickTransferFunction() {
        while (true) {
            let node = idMatches(ids["transfer_function"]).textMatches(texts["transfer"]).findOne(running_config["find_delay_duration"]);
            if (running_config["test_friends"]["clickTransferFunction"]["widget"]) {
                if (node_util.backtrackClickNode(node)) {
                    log_util.debug("控件点击转账功能成功");
                    break;
                }
                log_util.error("控件点击转账功能失败");
            }
            if (running_config["test_friends"]["clickTransferFunction"]["coordinate"]) {
                if (node_util.backtrackSimulationClickNode(node)) {
                    log_util.debug("坐标点击转账功能成功");
                    break;
                }
                log_util.error("坐标点击转账功能失败");
            }
            log_util.warn("转账功能控件id可能不一致");
        }
        return inputTransferAmount;
    }

    function normalPayee() {
        let payee_node = idMatches(ids["payee"]).findOnce();
        let payee = payee_node && payee_node.text();
        if (/.?\(.+\)/.test(payee) && payee != last_friend_remark) {
            db_util.addTestedFriend({ we_chat_id: last_we_chat_id, friend_remark: last_friend_remark, abnormal_message: '', selected: false, deleted: false, friend_type: db_util.NORMAL_FRIEND_TYPE });
            log_util.debug("正常联系人");
            return true;
        }
    }

    /**
     * 输入转账金额
     */
    function inputTransferAmount() {
        while (true) {
            if (normalPayee()) {
                return backToChatPage;
            }
            let transfer_amount_node = idMatches(ids["transfer_amount"]).findOnce();
            if (transfer_amount_node) {
                if (transfer_amount_node.setText("0.01")) {
                    log_util.debug("输入转账金额成功");
                    return clickConfirmTransfer;
                }
                log_util.error("输入转账金额失败");
            }
            log_util.warn("转账金额控件id可能不一致");
        }
    }

    /**
     * 点击转账
     */
    function clickConfirmTransfer() {
        while (true) {
            if (normalPayee()) {
                return backToChatPage;
            }
            let node = idMatches(ids["confirm_transfer"]).enabled().findOnce();
            if (running_config["test_friends"]["clickConfirmTransfer"]["widget"]) {
                if (node_util.backtrackClickNode(node)) {
                    log_util.debug("控件点击转账成功");
                    break;
                }
                log_util.error("控件点击转账失败");
            }
            if (running_config["test_friends"]["clickConfirmTransfer"]["coordinate"]) {
                if (node_util.backtrackSimulationClickNode(node)) {
                    log_util.debug("坐标点击转账成功");
                    break;
                }
                log_util.error("坐标点击转账失败");
            }
            log_util.debug("转账控件id可能不一致");
        }
        return assertionFriend;
    }

    function findClosePayPasswordNode() {
        let node = descMatches(texts["close"]).findOnce() || descMatches(texts["return"]).findOnce();
        if (!node) {
            log_util.debug("关闭转账控件desc可能不一致");
        }
        return node;
    }

    function findCancelPayNode() {
        let node = descMatches(texts["cancel_transfer"]).findOnce();
        if (!node) {
            log_util.debug("取消支付控件desc可能不一致");
        }
        return node;
    }

    /**
     * 判断好友关系
     */
    function assertionFriend() {
        while (true) {
            // 正常支付
            if (findClosePayPasswordNode()) {
                db_util.addTestedFriend({ we_chat_id: last_we_chat_id, friend_remark: last_friend_remark, abnormal_message: '', selected: false, deleted: false, friend_type: db_util.NORMAL_FRIEND_TYPE });
                log_util.debug("正常支付");
                return closePayPassword;
            }
            // 取消支付
            if (findCancelPayNode()) {
                db_util.addTestedFriend({ we_chat_id: last_friend_remark, friend_remark: last_friend_remark, abnormal_message: '', selected: false, deleted: false, friend_type: db_util.IGNORED_FRIEND_TYPE });
                log_util.debug("取消支付");
                return cancelPay;
            }
            let abnormal_message_node = idMatches(ids["abnormal_message"]).findOnce();
            let abnormal_message = abnormal_message_node && abnormal_message_node.text();
            if (abnormal_message) {
                if (texts["network_error"].match(abnormal_message) || texts["system_error"].match(abnormal_message)) {
                    // 网络错误，系统错误
                    db_util.addTestedFriend({ we_chat_id: last_friend_remark, friend_remark: last_friend_remark, abnormal_message: '', selected: false, deleted: false, friend_type: db_util.IGNORED_FRIEND_TYPE });
                    log_util.debug("其他异常，取消支付");
                } else {
                    // 支付异常
                    let selected = !!(texts["blacklisted_message"].match(abnormal_message) || texts["deleted_message"].match(abnormal_message));
                    db_util.addTestedFriend({ we_chat_id: last_we_chat_id, friend_remark: last_friend_remark, abnormal_message: abnormal_message, selected: selected, deleted: false, friend_type: db_util.ABNORMAL_FRIEND_TYPE });
                    log_util.debug("异常联系人");
                }
                return confirmTransAbnormalMessage;
            }
        }
    }

    /**
     * 关闭转账密码弹窗
     */
    function closePayPassword() {
        while (true) {
            let node = findClosePayPasswordNode();
            if (running_config["test_friends"]["closePayPassword"]["widget"]) {
                if (node_util.backtrackClickNode(node)) {
                    log_util.debug("控件点击关闭转账密码弹窗成功");
                    break;
                }
                log_util.error("控件点击关闭转账密码弹窗失败");
            }
            if (running_config["test_friends"]["closePayPassword"]["coordinate"]) {
                if (node_util.backtrackSimulationClickNode(node)) {
                    log_util.debug("坐标点击关闭转账密码弹窗成功");
                    break;
                }
                log_util.error("坐标点击关闭转账密码弹窗失败");
            }
        }
        return backToChatPage;
    }

    /**
     * 取消支付
     */
    function cancelPay() {
        while (true) {
            let node = findCancelPayNode();
            if (running_config["test_friends"]["cancelPay"]["widget"]) {
                if (node_util.backtrackClickNode(node)) {
                    log_util.debug("控件点击取消支付成功");
                    break;
                }
                log_util.error("控件点击取消支付失败");
            }
            if (running_config["test_friends"]["cancelPay"]["coordinate"]) {
                if (node_util.backtrackSimulationClickNode(node)) {
                    log_util.debug("坐标点击取消支付成功");
                    break;
                }
                log_util.error("坐标点击取消支付失败");
            }
        }
        return backToChatPage;
    }

    /**
     * 关闭消息弹窗
     */
    function confirmTransAbnormalMessage() {
        while (true) {
            let node = idMatches(ids["confirm_abnormal_message"]).findOne(running_config["find_delay_duration"]);
            if (running_config["test_friends"]["confirmTransAbnormalMessage"]["widget"]) {
                if (node_util.backtrackClickNode(node)) {
                    log_util.debug("控件点击关闭消息弹窗成功");
                    break;
                }
                log_util.error("控件点击关闭消息弹窗失败");
            }
            if (running_config["test_friends"]["confirmTransAbnormalMessage"]["coordinate"]) {
                if (node_util.backtrackSimulationClickNode(node)) {
                    log_util.debug("坐标点击关闭消息弹窗成功");
                    break;
                }
                log_util.error("坐标点击关闭消息弹窗失败");
            }
            log_util.warn("关闭消息弹窗控件id可能不一致");
        }
        return backToChatPage;
    }

    /**
     * 返回聊天页面
     */
    function backToChatPage() {
        while (true) {
            let node = idMatches(ids["back_to_chat"]).findOne(running_config["find_delay_duration"]);
            if (running_config["test_friends"]["backToChatPage"]["widget"]) {
                if (node_util.backtrackClickNode(node)) {
                    log_util.debug("控件点击返回聊天页面成功");
                    break;
                }
                log_util.error("控件点击返回聊天页面失败");
            }
            if (running_config["test_friends"]["backToChatPage"]["coordinate"]) {
                if (node_util.backtrackSimulationClickNode(ndoe)) {
                    log_util.debug("坐标点击返回聊天页面成功");
                    break;
                }
                log_util.error("坐标点击返回聊天页面失败");
            }
            log_util.warn("返回聊天页面控件id可能不一致");
        }
        return backToChatList;
    }

    /**
     * 返回聊天列表
     */
    function backToChatList() {
        while (true) {
            let node = idMatches(ids["back_to_chats"]).findOne(running_config["find_delay_duration"]);
            if (running_config["test_friends"]["backToChatList"]["widget"]) {
                if (node_util.backtrackClickNode(node)) {
                    log_util.debug("控件点击返回聊天列表成功");
                    break;
                }
                log_util.error("控件点击返回聊天列表失败");
            }
            if (running_config["test_friends"]["backToChatList"]["coordinate"]) {
                if (node_util.backtrackSimulationClickNode(node)) {
                    log_util.debug("坐标点击返回聊天列表成功");
                    break;
                }
                log_util.error("坐标点击返回聊天列表失败");
            }
            log_util.warn("返回聊天列表控件id可能不一致");
        }
        log_util.info("---------------聊天页面---------------");
        return clickContacts;
    }

    /**
     * 滚动好友列表
     */
    function scrollFriendList() {
        while (true) {
            if (running_config["test_friends"]["scrollFriendList"]["widget"]) {
                // 控件滚动联系人列表
                let node = idMatches(ids["friend_list"]).findOne(running_config["find_delay_duration"]);
                if (node) {
                    if (node.bounds().left == node.bounds().right) {
                        log_util.warn("联系人列表控件宽度为0");
                    }
                    if (node_util.scrollForward(node)) {
                        log_util.debug("控件滚动联系人列表成功");
                        break;
                    }
                    log_util.error("控件滚动联系人列表失败");
                } else {
                    log_util.warn("联系人列表控件id可能不一致");
                }
            }
            if (running_config["test_friends"]["scrollFriendList"]["coordinate"]) {
                // 坐标滚动联系人列表
                setScreenMetrics(1080, 1920);
                if (swipe(540, 1658, 540, 428, running_config["click_delay_duration"])) {
                    log_util.debug("坐标滚动联系人列表成功");
                    break;
                }
                log_util.error("坐标滚动联系人列表失败");
            }
        }
        last_index = 0;
        log_util.info("---------------好友列表页面---------------");
        return clickContacts;
    }

    /**
     * 返回好友列表
     */
    function backToFriendList() {
        while (true) {
            let node = idMatches(ids["back_to_friend_list"]).findOne(running_config["find_delay_duration"]);
            if (running_config["test_friends"]["backToFriendList"]["widget"]) {
                if (node_util.backtrackClickNode(node)) {
                    log_util.debug("控件点击返回联系人列表页面成功");
                    break;
                }
                log_util.error("控件点击返回联系人列表页面失败");
            }
            if (running_config["test_friends"]["backToFriendList"]["coordinate"]) {
                if (node_util.backtrackSimulationClickNode(node)) {
                    log_util.debug("坐标点击返回联系人列表页面成功");
                    break;
                }
                log_util.error("坐标点击返回联系人列表页面失败");
            }
            log_util.warn("返回联系人列表控件id可能不一致");
        }
        log_util.info("---------------好友详情页面---------------");
        return clickFriend;
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
            events.onceKeyDown("volume_down", () => {
                stopScript();
            });
        });
    }

    /**
     * 累计器监听器
     */
    function accumulatorListener() {
        threads.start(function () {
            let localAccumulator = 0;
            setInterval(() => {
                if (localAccumulator == accumulator) {
                    stuck = true;
                    stopScript();
                }
                localAccumulator = accumulator;
            }, running_config["accumulator_delay_duration"]);
        });
    }

    /**
     * 停止脚本运行
     */
    function stopScript() {
        run = false;
        db_util.deleteIgnoredTestFriend();
        device.cancelKeepingAwake();
        events.removeAllListeners();
        threads.shutDownAll();
        toast(language["script_stopped"]);
        log_util.info("---------------结束测试好友---------------");
        if (stuck && running_config["reboot_script"]) {
            engines.execScriptFile(engines.myEngine().getSource().toString());
        } else {
            engines.execScriptFile("main.js");
        }
        engines.myEngine().forceStop();
    }

    function main() {
        node_util = require("utils/node_util.js");
        db_util = require("utils/db_util.js");
        log_util = require("utils/log_util.js");
        app_util = require("utils/app_util.js");

        language = app_util.getLanguage();
        running_config = app_util.getRunningConfig();
        ids = app_util.getWeChatIds();
        texts = app_util.getWeChatTexts();

        last_index = 0, run = true, accumulator = 0;

        let test_friends = {};
        for (let method of running_config["test_friends"]) {
            test_friends[method["function_name"]] = method;
        }
        running_config["test_friends"] = test_friends;

        keyDownListenerByVolumeDown();
        accumulatorListener();
        device.keepScreenDim();

        toast(language["script_running"]);
        log_util.info("---------------开始测试好友---------------");

        // 确保在微信首页
        let we_chat_package_name = app_util.getConfig()["we_chat_package_name"];
        launch(we_chat_package_name);
        waitForPackage(we_chat_package_name);
        while (!findContactsNode()) {
            back();
            if (currentPackage() == we_chat_package_name) {
                accumulator++;
            }
        }

        /**
         * 此方式流程控制较为灵活
         */
        for (let nextFunction = clickContacts; run && nextFunction; nextFunction = nextFunction()) {
            accumulator++;
            let method = running_config["test_friends"][nextFunction.name];
            if (method && method["delay"]) {
                sleep(running_config["click_delay_duration"])
            }
        }
    }

    main();
})();