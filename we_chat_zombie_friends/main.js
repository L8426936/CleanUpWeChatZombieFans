"ui";

(() => {
    ui.layout(
        <vertical>
            <appbar>
                <toolbar id="toolbar">
                </toolbar>
                <tabs id="tabs" />
            </appbar>
            <viewpager id="viewpager" layout_weight="1">
                <frame>
                    <list id="abnormal_friend_list">
                        <horizontal padding="0 8">
                            <checkbox id="selected_checkbox" layout_gravity="center" checked="{{selected}}" />
                            <vertical>
                                <text id="friend_remark_text" text="{{friend_remark}}" />
                                <text id="we_chat_id_text" text="{{we_chat_id}}" />
                                <text id="abnormal_message_text" text="{{abnormal_message}}" />
                            </vertical>
                        </horizontal>
                    </list>
                </frame>
                <frame>
                    <list id="normal_friend_list">
                        <horizontal padding="0 8">
                            <checkbox id="selected_checkbox" layout_gravity="center" checked="{{selected}}" />
                            <vertical>
                                <text id="friend_remark_text" text="{{friend_remark}}" />
                                <text id="we_chat_id_text" text="{{we_chat_id}}" />
                            </vertical>
                        </horizontal>
                    </list>
                </frame>
                <frame>
                    <list id="ignored_friend_list">
                        <text padding="8" text="{{friend_remark}}" />
                    </list>
                </frame>
            </viewpager>
            <horizontal bg="#EBEBEB">
                <button id="clear_friends_data_button" layout_weight="1" style="Widget.AppCompat.Button.Borderless" textStyle="bold"/>
                <button id="delete_friends_button" layout_weight="1" textColor="#CC0000" style="Widget.AppCompat.Button.Borderless" textStyle="bold"/>
                <button id="test_friends_button" layout_weight="1" textColor="#008274" style="Widget.AppCompat.Button.Borderless" textStyle="bold"/>
            </horizontal>
        </vertical>
    );

    let config, language, texts, abnormal_friends, normal_friends, no_more_warning = false;

    /**
     * 初始化配置
     */
    function initConfig() {
        config = JSON.parse(open("./config/config.json").read());
        texts = JSON.parse(open("./config/text_id/text.json").read());
        let default_language = checkSupportedLanguage() ? context.resources.configuration.locale.language + "-" + context.resources.configuration.locale.country : "zh-CN";
        language = JSON.parse(open("./config/languages/" + default_language + ".json").read());
    }
    initConfig();

    /**
     * 初始化UI
     */
    function initUI() {
        abnormal_friends = files.exists("./data/abnormal_friends.json") ? JSON.parse(open("./data/abnormal_friends.json").read()) : {};
        normal_friends = files.exists("./data/normal_friends.json") ? JSON.parse(open("./data/normal_friends.json").read()) : {};
        let ignored_friends = files.exists("./data/ignored_friends.json") ? JSON.parse(open("./data/ignored_friends.json").read()) : {};
        
        let abnormal_friend_list = [];
        for (let friend_remark in abnormal_friends) {
            for (let we_chat_id in abnormal_friends[friend_remark]) {
                abnormal_friend_list.push(abnormal_friends[friend_remark][we_chat_id]);
            }
        }
        ui.abnormal_friend_list.setDataSource(abnormal_friend_list);
        
        let normal_friend_list = [];
        for (let friend_remark in normal_friends) {
            for (let we_chat_id in normal_friends[friend_remark]) {
                normal_friend_list.push(normal_friends[friend_remark][we_chat_id]);
            }
        }
        ui.normal_friend_list.setDataSource(normal_friend_list);
        
        let ignored_friend_list = [];
        for (let friend_remark in ignored_friends) {
            ignored_friend_list.push({friend_remark: friend_remark});
        }
        ui.ignored_friend_list.setDataSource(ignored_friend_list);

        ui.clear_friends_data_button.setText(language["clear_friend_data"]);
        ui.delete_friends_button.setText(language["delete_friend"]);
        ui.test_friends_button.setText(language["test_friend"]);
        let supported_language = checkSupportedLanguage();
        ui.delete_friends_button.enabled = supported_language;
        ui.test_friends_button.enabled = supported_language;
        if (!supported_language) {
            ui.delete_friends_button.textColor = colors.parseColor("#B2B2B2");
            ui.test_friends_button.textColor = colors.parseColor("#B2B2B2");
            dialogs.build({
                content: "Does not support system language",
                positive: "Confirm",
                positiveColor: "#008274",
                cancelable: false
            }).show();
        }
    }
    initUI();
    ui.emitter.on("resume", initUI);

    /**
     * 检验语言
     */
    function checkSupportedLanguage() {
        let local_language = context.resources.configuration.locale.language + "-" + context.resources.configuration.locale.country;
        for (let i = 0; i < config["supported_language"].length; i++) {
            if (config["supported_language"][i] == local_language) {
                return true;
            }
        }
        return false;
    }

    /**
     * 校验已安装微信
     * @returns {boolean}
     */
    function checkInstalledWeChat() {
        let installed_we_chat = getAppName(config["we_chat_package_name"]) != null;
        if (!installed_we_chat) {
            dialogs.build({
                content: language["uninstalled_we_chat_alert_dialog_message"],
                positive: language["confirm"],
                positiveColor: "#008274",
                cancelable: false
            }).show();
        }
        return installed_we_chat;
    }

    /**
     * 校验支持微信版本
     * @returns {boolean}
     */
    function checkSupportedWeChatVersion() {
        let app_util = require("./utils/app_util.js");
        let we_chat_version = app_util.getAppVersion(config["we_chat_package_name"]);
        let min_supported_version = config["min_supported_version"];
        let max_supported_version = config["max_supported_version"];
        let supported = app_util.supported(we_chat_version, min_supported_version, max_supported_version);
        if (!supported) {
            dialogs.build({
                content: language["unsupported_we_chat_version_alert_dialog_message"].replace("%min_supported_version", min_supported_version).replace("%max_supported_version", max_supported_version).replace("%we_chat_version", we_chat_version),
                positive: language["confirm"],
                positiveColor: "#008274",
                cancelable: false
            }).show();
        }
        return supported;
    }

    /**
     * 校验文件
     * @returns {boolean}
     */
    function checkFile() {
        let app_util = require("./utils/app_util.js");
        let min_supported_version, max_supported_version;
        let we_chat_version = app_util.getAppVersion(config["we_chat_package_name"]);
        for (let i = 0; i < config["supported_version"].length; i++) {
            if (app_util.supported(we_chat_version, config["supported_version"][i]["min_supported_version"], config["supported_version"][i]["max_supported_version"])) {
                min_supported_version = config["supported_version"][i]["min_supported_version"];
                max_supported_version = config["supported_version"][i]["max_supported_version"];
                break;
            }
        }
        let exists = files.exists("./config/text_id/" + min_supported_version + "-" + max_supported_version + ".json");
        if (!exists) {
            dialogs.build({
                content: language["file_lost_alert_dialog_message"].replace("%file_name", "./config/text_id/" + min_supported_version + "-" + max_supported_version + ".json"),
                positive: language["confirm"],
                negativeColor: "#008274",
                cancelable: false
            }).show();
        }
        return exists;
    }
    
    /**
     * 校验已开启无障碍服务
     * @returns {boolean}
     */
    function checkService() {
        let enabled = auto.service != null;
        if (!enabled) {
            dialogs.build({
                content: language["jump_to_settings_alert_dialog_message"],
                positive: language["confirm"],
                positiveColor: "#008274",
                negative: language["cancel"],
                negativeColor: "#008274",
                cancelable: false
            }).on("positive", () => {
                app.startActivity({
                    action: "android.settings.ACCESSIBILITY_SETTINGS"
                });
            }).show();
        }
        return enabled;
    }

    // 创建选项菜单(右上角)
    ui.emitter.on("create_options_menu", menu => {
        menu.add(language["about"]);
    });
    // 监听选项菜单点击
    ui.emitter.on("options_item_selected", (e, item) => {
        switch (item.getTitle()) {
            case language["about"]:
                dialogs.build({
                    content: language["about_alert_dialog_message"],
                    positive: language["open_in_browser"],
                    positiveColor: "#008274",
                    negative: language["confirm"],
                    negativeColor: "#008274",
                    cancelable: false
                }).on("positive", () => {
                    app.openUrl("https://github.com/L8426936/");
                }).show();
                break;
        }
        e.consumed = true;
    });
    ui.toolbar.title = language["app_name"];
    activity.setSupportActionBar(ui.toolbar);

    // 设置滑动页面的标题
    ui.viewpager.setTitles([language["abnormal_friend"], language["normal_friend"], language["ignored_friend"]]);
    // 让滑动页面和标签栏联动
    ui.tabs.setupWithViewPager(ui.viewpager);

    ui.abnormal_friend_list.on("item_bind", (itemView, itemHolder) => {
        itemView.selected_checkbox.on("check", () => {
            itemView.selected_checkbox.enabled = !itemHolder.item["deleted"];
            itemView.friend_remark_text.enabled = !itemHolder.item["deleted"];
            itemView.we_chat_id_text.enabled = !itemHolder.item["deleted"];
            itemView.abnormal_message_text.enabled = !itemHolder.item["deleted"];
        });
        itemView.selected_checkbox.on("click", () => {
            let item = itemHolder.item;
            let abnormal_message = item.abnormal_message;
            if (!no_more_warning && itemView.selected_checkbox.checked && texts["blacklisted_message"].match(abnormal_message) == null && texts["deleted_message"].match(abnormal_message) == null) {
                let selected_no_more_warning = false;
                dialogs.build({
                    title: language["warning"],
                    content: language["selected_warining_alert_dialog_message"],
                    checkBoxPrompt: language["no_more_warning"],
                    positive: language["cancel"],
                    positiveColor: "#008274",
                    negative: language["confirm"],
                    negativeColor: "#CC0000",
                    cancelable: false
                }).on("check", (checked) => {
                    selected_no_more_warning = checked;
                }).on("positive", () => {
                    itemView.selected_checkbox.checked = false;
                }).on("negative", () => {
                    no_more_warning = selected_no_more_warning;
                    abnormal_friends[item["friend_remark"]][item["we_chat_id"]]["selected"] = true;
                    files.write("./data/abnormal_friends.json", JSON.stringify(abnormal_friends));
                }).show();
            } else {
                abnormal_friends[item["friend_remark"]][item["we_chat_id"]]["selected"] = itemView.selected_checkbox.checked;
                files.write("./data/abnormal_friends.json", JSON.stringify(abnormal_friends));
            }
        });
    });

    ui.normal_friend_list.on("item_bind", (itemView, itemHolder) => {
        itemView.selected_checkbox.on("check", () => {
            itemView.selected_checkbox.enabled = !itemHolder.item["deleted"];
            itemView.friend_remark_text.enabled = !itemHolder.item["deleted"];
            itemView.we_chat_id_text.enabled = !itemHolder.item["deleted"];
        });
        itemView.selected_checkbox.on("click", () => {
            let item = itemHolder.item;
            if (!no_more_warning && itemView.selected_checkbox.checked) {
                let selected_no_more_warning = false;
                dialogs.build({
                    title: language["warning"],
                    content: language["selected_warining_alert_dialog_message"],
                    checkBoxPrompt: language["no_more_warning"],
                    positive: language["cancel"],
                    positiveColor: "#008274",
                    negative: language["confirm"],
                    negativeColor: "#CC0000",
                    cancelable: false
                }).on("check", (checked) => {
                    selected_no_more_warning = checked;
                }).on("positive", () => {
                    itemView.selected_checkbox.checked = false;
                }).on("negative", () => {
                    no_more_warning = selected_no_more_warning;
                    normal_friends[item["friend_remark"]][item["we_chat_id"]]["selected"] = true;
                    files.write("./data/normal_friends.json", JSON.stringify(normal_friends));
                }).show();
            } else {
                normal_friends[item["friend_remark"]][item["we_chat_id"]]["selected"] = itemView.selected_checkbox.checked;
                files.write("./data/normal_friends.json", JSON.stringify(normal_friends));
            }
        });
    });

    ui.clear_friends_data_button.on("click", () => {
        dialogs.build({
            content: language["clear_friend_data_alert_dialog_message"],
            positive: language["cancel"],
            positiveColor: "#008274",
            negative: language["confirm"],
            negativeColor: "#008274",
            cancelable: false
        }).on("negative", () => {
            files.remove("./data/abnormal_friends.json");
            files.remove("./data/normal_friends.json");
            files.remove("./data/ignored_friends.json");
            initConfig();
            initUI();
        }).show();
    });
    
    ui.delete_friends_button.on("click", () => {
        let selected = false;
        check_abnormal_friends:
        for (let friend_remark in abnormal_friends) {
            for (let we_chat_id in abnormal_friends[friend_remark]) {
                if (!abnormal_friends[friend_remark][we_chat_id].deleted && abnormal_friends[friend_remark][we_chat_id].selected) {
                    selected = true;
                    break check_abnormal_friends;
                }
            }
        }
        if (!selected) {
            check_normal_friends:
            for (let friend_remark in normal_friends) {
                for (let we_chat_id in normal_friends[friend_remark]) {
                    if (!normal_friends[friend_remark][we_chat_id].deleted && normal_friends[friend_remark][we_chat_id].selected) {
                        selected = true;
                        break check_normal_friends;
                    }
                }
            }
        }
        if (selected) {
            if (checkInstalledWeChat() && checkSupportedWeChatVersion() && checkFile() && checkService()) {
                dialogs.build({
                    title: language["warning"],
                    content: language["delete_friend_alert_dialog_message"],
                    positive: language["cancel"],
                    positiveColor: "#008274",
                    negative: language["confirm"],
                    negativeColor: "#CC0000",
                    cancelable: false
                }).on("negative", () => {
                    threads.start(function () {
                        let delete_friends = require("./modules/delete_friends.js");
                        delete_friends.main();
                    });
                }).show();
            }
        } else {
            dialogs.build({
                content: language["not_select_friend_alert_dialog_message"],
                positive: language["confirm"],
                positiveColor: "#008274",
                cancelable: false
            }).show();
        }
    });

    ui.test_friends_button.on("click", () => {
        if (checkInstalledWeChat() && checkSupportedWeChatVersion() && checkFile() && checkService()) {
            dialogs.build({
                content: language["test_friend_alert_dialog_message"],
                positive: language["confirm"],
                positiveColor: "#008274",
                negative: language["cancel"],
                negativeColor: "#008274",
                cancelable: false
            }).on("positive", () => {
                threads.start(function () {
                    let test_friends = require("./modules/test_friends.js");
                    test_friends.main();
                });
            }).show();
        }
    });
})();