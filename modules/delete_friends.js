/**
 * 删除好友
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
    let count_wait_delete_friend;
    /**
     * 运行状态
     */
    let run;
    let stuck;
    let accumulator;

    /**
     * 点击通讯录
     */
    function clickContacts() {
        while (true) {
            if (node_util.backtrackClickNode(idMatches(ids["contacts"]).textMatches(texts["contacts"]).findOne(running_config["find_delay_duration"]))) {
                log_util.debug("控件点击通讯录成功");
                break;
            }
            log_util.warn("控件点击通讯录失败");
            sleep(running_config["click_delay_duration"]);
            if (node_util.backtrackSimulationClickNode(idMatches(ids["contacts"]).textMatches(texts["contacts"]).findOne(running_config["find_delay_duration"]))) {
                log_util.debug("坐标点击通讯录成功");
                break;
            }
            log_util.error("坐标点击通讯录失败");
        }
        sleep(running_config["click_delay_duration"]);
        return clickFriend;
    }

    /**
     * 点击好友
     */
    function clickFriend() {
        let friend_remark_nodes = idMatches(ids["friend_remark"]).visibleToUser(true).find();
        while (last_index < friend_remark_nodes.size()) {
            last_friend_remark = friend_remark_nodes.get(last_index).text();
            if (db_util.isSelectedFriendForDeleteByFriendRemark(last_friend_remark)) {
                if (node_util.backtrackClickNode(friend_remark_nodes.get(last_index))) {
                    last_index++;
                    log_util.debug("控件点击联系人成功");
                    return checkWeChatId;
                }
                log_util.warn("控件点击联系人失败");
                sleep(running_config["click_delay_duration"]);
                if (node_util.backtrackSimulationClickNode(idMatches(ids["friend_remark"]).visibleToUser(true).findOnce(last_index))) {
                    last_index++;
                    log_util.debug("坐标点击联系人成功");
                    return checkWeChatId;
                }
                log_util.error("坐标点击联系人失败");
            }
            last_index++;
        }
        log_util.info("---------------好友列表页面---------------");
        return idMatches(ids["contacts_count"]).findOnce() ? stopScript : scrollFriendList;
    }

    /**
    * 检查微信号是否相同
    */
    function checkWeChatId() {
        let we_chat_id_node = idMatches(ids["we_chat_id"]).findOne(running_config["find_delay_duration"]);
        if (we_chat_id_node) {
            last_we_chat_id = we_chat_id_node.text();
            if (db_util.isSelectedFriendForDeleteByWeChatID(last_we_chat_id)) {
                return clickMoreFunction;
            }
            return backToFriendList;
        }
        log_util.warn("微信号控件id可能不一致");
        return scrollFriendDetailsPage;
    }

    /**
     * 滚动联系人详情页
     */
    function scrollFriendDetailsPage() {
        while (true) {
            let node = idMatches(ids["friend_details_page_list"]).findOne(running_config["find_delay_duration"]);
            // 控件滚动联系人详情页
            if (node) {
                if (node.bounds().right > node.bounds().left) {
                    if (node_util.scrollForward(node)) {
                        log_util.debug("控件滚动联系人详情页成功");
                        sleep(running_config["click_delay_duration"]);
                        break;
                    }
                    log_util.warn("控件滚动联系人详情页失败");
                } else {
                    log_util.warn("联系人详情页控件宽度为0");
                }
            } else {
                log_util.warn("联系人详情页控件id可能不一致");
            }
            // 坐标滚动联系人详情页
            setScreenMetrics(1080, 1920);
            if (swipe(540, 1658, 540, 428, running_config["click_delay_duration"])) {
                log_util.debug("坐标滚动联系人详情页成功");
                break;
            }
            log_util.error("坐标滚动联系人详情页失败");
        }
        return checkWeChatId;
    }

    /**
     * 点击更多功能
     */
    function clickMoreFunction() {
        while (true) {
            if (node_util.backtrackClickNode(idMatches(ids["more_function_by_delete"]).findOne(running_config["find_delay_duration"]))) {
                log_util.debug("控件点击更多功能成功");
                break;
            }
            log_util.warn("控件点击更多功能失败");
            sleep(running_config["click_delay_duration"]);
            if (node_util.backtrackSimulationClickNode(idMatches(ids["more_function_by_delete"]).findOne(running_config["find_delay_duration"]))) {
                log_util.debug("坐标点击更多功能成功");
                break;
            }
            log_util.error("坐标点击更多功能失败");
        }
        return clickDeleteFunction;
    }

    /**
     * 点击删除功能
     */
    function clickDeleteFunction() {
        if (node_util.backtrackClickNode(idMatches(ids["delete"]).textMatches(texts["delete"]).findOne(running_config["find_delay_duration"]))) {
            log_util.debug("控件点击删除功能成功");
            return clickConfirmDelete;
        }
        log_util.warn("控件点击删除功能失败");
        sleep(running_config["click_delay_duration"]);
        if (node_util.backtrackSimulationClickNode(idMatches(ids["delete"]).textMatches(texts["delete"]).findOne(running_config["find_delay_duration"]))) {
            log_util.debug("坐标点击删除功能成功");
            return clickConfirmDelete;
        }
        log_util.error("坐标点击删除功能失败");
        return scrollMoreFunctionPage;
    }

    /**
     * 点击确认删除
     */
    function clickConfirmDelete() {
        while (true) {
            if (node_util.backtrackClickNode(idMatches(ids["confirm_delete"]).findOne(running_config["find_delay_duration"]))) {
                log_util.debug("控件点击删除成功");
                break;
            }
            log_util.warn("控件点击删除失败");
            sleep(running_config["click_delay_duration"]);
            if (node_util.backtrackSimulationClickNode(idMatches(ids["confirm_delete"]).findOne(running_config["find_delay_duration"]))) {
                log_util.debug("坐标点击删除成功");
                break;
            }
            log_util.error("坐标点击删除失败");
        }
        last_index--;
        db_util.modifyTestedFriend({ we_chat_id: last_we_chat_id, deleted: true });
        db_util.deleteLabelFriendByFriendRemark(last_friend_remark);
        log_util.info("---------------更多功能页面---------------");
        return --count_wait_delete_friend ? clickFriend : stopScript;
    }

    /**
     * 滚动更多功能页面
     */
    function scrollMoreFunctionPage() {
        while (true) {
            let node = idMatches(ids["more_function_by_delete_list"]).findOne(running_config["find_delay_duration"]);
            // 控件滚动更多功能页面
            if (node) {
                if (node.bounds().right > node.bounds().left) {
                    if (node_util.scrollForward(node)) {
                        log_util.debug("控件滚动更多功能页面成功");
                        sleep(running_config["click_delay_duration"]);
                        break;
                    }
                    log_util.warn("控件滚动更多功能页面失败");
                } else {
                    log_util.warn("更多功能页面控件宽度为0");
                }
            } else {
                log_util.warn("更多功能页面控件id可能不一致");
            }
            // 坐标滚动更多功能页面
            setScreenMetrics(1080, 1920);
            if (swipe(540, 1658, 540, 428, running_config["click_delay_duration"])) {
                log_util.debug("坐标滚动更多功能页面成功");
                break;
            }
            log_util.error("坐标滚动更多功能页面失败");
        }
        return clickDeleteFunction;
    }

    /**
     * 返回好友列表
     */
    function backToFriendList() {
        while (true) {
            if (node_util.backtrackClickNode(idMatches(ids["back_to_friend_list"]).findOne(running_config["find_delay_duration"]))) {
                log_util.debug("控件点击返回好友列表成功");
                break;
            }
            log_util.warn("控件点击返回好友列表失败");
            sleep(running_config["click_delay_duration"]);
            if (node_util.backtrackSimulationClickNode(idMatches(ids["back_to_friend_list"]).findOne(running_config["find_delay_duration"]))) {
                log_util.debug("坐标点击返回好友列表成功");
                break;
            }
            log_util.error("坐标点击返回好友列表失败");
        }
        log_util.info("---------------好友详情页面---------------");
        return clickFriend;
    }

    /**
     * 滚动好友列表
     */
    function scrollFriendList() {
        while (true) {
            let friend_list_node = idMatches(ids["friend_list"]).findOne(running_config["find_delay_duration"]);
            // 控件滚动联系人列表
            if (friend_list_node) {
                if (friend_list_node.bounds().right > friend_list_node.bounds().left) {
                    if (node_util.scrollForward(friend_list_node)) {
                        log_util.debug("控件滚动联系人列表成功");
                        sleep(running_config["click_delay_duration"]);
                        break;
                    }
                    log_util.warn("控件滚动联系人列表失败");
                } else {
                    log_util.warn("联系人列表控件宽度为0");
                }
            } else {
                log_util.warn("联系人列表控件id可能不一致");
            }
            // 坐标滚动联系人列表
            setScreenMetrics(1080, 1920);
            if (swipe(540, 1658, 540, 428, running_config["click_delay_duration"])) {
                log_util.debug("坐标滚动联系人列表成功");
                break;
            }
            log_util.error("坐标滚动联系人列表失败");
        }
        last_index = 0;
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
        device.cancelKeepingAwake();
        events.removeAllListeners();
        threads.shutDownAll();
        toast(language["script_stopped"]);
        log_util.info("---------------结束删除好友---------------");
        engines.myEngine().forceStop();
        if (stuck && running_config["reboot_script"]) {
            engines.execScriptFile(engines.myEngine().getSource().toString());
        } else {
            engines.execScriptFile("main.js");
        }
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

        keyDownListenerByVolumeDown();
        accumulatorListener();
        device.keepScreenDim();

        toast(language["script_running"]);
        log_util.info("---------------开始删除好友---------------");

        // 确保在微信首页
        let we_chat_package_name = app_util.getConfig()["we_chat_package_name"];
        launch(we_chat_package_name);
        waitForPackage(we_chat_package_name);
        while (!idMatches(ids["contacts"]).textMatches(texts["contacts"]).findOne(running_config["find_delay_duration"])) {
            back();
            if (currentPackage() == we_chat_package_name) {
                accumulator++;
            }
        }

        /**
         * 此方式流程控制较为灵活
         */
        count_wait_delete_friend = db_util.countWaitDeleteFriend();
        for (let nextFunction = clickContacts(); run && nextFunction; nextFunction = nextFunction()) {
            accumulator++;
        }
    }

    main();
})();