"ui";
(() => {
    ui.layout(
        <vertical>
            <list id="label_whitelist" layout_weight="1">
                <horizontal padding="8" w="*">
                    <text text="{{label}}" layout_weight="1" maxLines="1" ellipsize="end"/>
                    <Switch id="ignored_switch" checked="{{ignored}}"/>
                </horizontal>
            </list>
            <horizontal bg="#EBEBEB">
                <button id="clear_labels_button" layout_weight="1" textColor="#CC0000" style="Widget.AppCompat.Button.Borderless" textStyle="bold"/>
                <button id="import_labels_button" layout_weight="1" textColor="#008274" style="Widget.AppCompat.Button.Borderless" textStyle="bold"/>
                <button id="test_friends_button" layout_weight="1" textColor="#008274" style="Widget.AppCompat.Button.Borderless" textStyle="bold"/>
            </horizontal>
        </vertical>
    );

    let language, db_util, app_util;

    /**
     * 初始化配置
     */
    function init() {
        db_util = require("utils/db_util.js");
        app_util = require("utils/app_util.js");
        language = app_util.language();

        ui.clear_labels_button.setText(language["clear_label"]);
        ui.import_labels_button.setText(language["import_label"]);
        ui.test_friends_button.setText(language["test_friend"]);

        if (!app_util.checkSupportedLanguage()) {
            ui.import_labels_button.enabled = false;
            ui.test_friends_button.enabled = false;
            ui.import_labels_button.textColor = colors.parseColor("#B2B2B2");
            ui.test_friends_button.textColor = colors.parseColor("#B2B2B2");
        }
    }
    init();
    
    /**
     * 初始化UI
     */
    function initUI() {
        ui.label_whitelist.setDataSource(db_util.findAllLabelWhitelist());
    }
    initUI();

    ui.label_whitelist.on("item_bind", (itemView, itemHolder) => {
        itemView.ignored_switch.on("click", () => {
            let label_whitelist = itemHolder.item;
            if (label_whitelist.ignored != itemView.ignored_switch.checked) {
                label_whitelist.ignored = itemView.ignored_switch.checked;
                db_util.modifyLabelWhitelist(label_whitelist);
                db_util.modifyFriendLabelWhitelist(label_whitelist);
            }
        });
    });

    ui.clear_labels_button.on("click", () => {
        dialogs.build({
            content: language["clear_alert_dialog_message"],
            positive: language["cancel"],
            positiveColor: "#008274",
            negative: language["confirm"],
            negativeColor: "#008274",
            cancelable: false
        }).on("negative", () => {
            db_util.deleteAllLabelWhitelist();
            db_util.deleteAllFriendLabelWhitelist();
            initUI();
        }).show();
    });
    
    ui.import_labels_button.on("click", () => {
        if (app_util.checkInstalledWeChat() && app_util.checkSupportedWeChatVersion() && app_util.checkFile() && app_util.checkService()) {
            let running_config = app_util.runningConfig();
            dialogs.build({
                content: language["before_running_alert_dialog_message"],
                checkBoxPrompt: language["import_label_include_friends"],
                checkBoxChecked: !!(running_config["import_label_include_friends"]),
                positive: language["confirm"],
                positiveColor: "#008274",
                negative: language["cancel"],
                negativeColor: "#008274",
                cancelable: false
            }).on("check", checked => {
                running_config["import_label_include_friends"] = checked;
                files.write("config/running_config.json", JSON.stringify(running_config));
            }).on("positive", () => {
                engines.execScriptFile("modules/import_labels.js", {delay: 500});
                app_util.stopScript();
            }).show();
        }
    });

    ui.test_friends_button.on("click", () => {
        app_util.testFriends();
    });
})();