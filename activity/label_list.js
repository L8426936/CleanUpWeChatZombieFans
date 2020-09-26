"ui";
(() => {
    ui.layout(
        <vertical>
            <list id="label_list" layout_weight="1">
                <horizontal w="*">
                    <text paddingLeft="8" paddingTop="10" paddingBottom="10" id="label" text="{{label}}" maxLines="1" ellipsize="end"/>
                    <text paddingTop="10" paddingBottom="10" id="count" text="({{count}})" layout_weight="1" maxLines="1" ellipsize="end"/>
                    <Switch id="enabled_switch" checked="{{enabled}}" layout_gravity="center"/>
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
        language = app_util.getLanguage();

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
        ui.label_list.setDataSource(db_util.findAllLabel());
    }
    initUI();
    // 当用户回到本界面时，resume事件会被触发
    ui.emitter.on("resume", function() {
        initUI();
    });

    function showFriendList(label) {
        let running_config = app_util.getRunningConfig();
        running_config["label"] = label;
        files.write("config/running_config.json", JSON.stringify(running_config));
        engines.execScriptFile("activity/label_friend_list.js");
    }

    ui.label_list.on("item_bind", (itemView, itemHolder) => {
        itemView.label.on("click", () => {
            showFriendList(itemHolder.item["label"]);
        });
        itemView.count.on("click", () => {
            showFriendList(itemHolder.item["label"]);
        });
        itemView.enabled_switch.on("click", () => {
            let label = itemHolder.item;
            label["enabled"] = itemView.enabled_switch.checked;
            db_util.modifyLabel(label);
            db_util.modifyLabelFriendByLabel(label);
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
            db_util.deleteAllLabel();
            db_util.deleteAllLabelFriend();
            initUI();
        }).show();
    });
    
    ui.import_labels_button.on("click", () => {
        if (app_util.checkInstalledWeChat()) {
            let running_config = app_util.getRunningConfig();
            let view = {
                content: language["before_running_alert_dialog_message"],
                positive: language["confirm"],
                positiveColor: "#008274",
                negative: language["cancel"],
                negativeColor: "#008274",
                cancelable: false
            };
            if (!app_util.isFromGooglePlayStoreByApplication()) {
                view["checkBoxPrompt"] = language["is_from_google_play_store"];
                view["checkBoxChecked"] = app_util.isFromGooglePlayStoreByLocation();
            }
            dialogs.build(view)
            .on("check", checked => {
                app_util.checkInstallSource(checked, running_config);
            }).on("positive", () => {
                if (app_util.checkSupportedWeChatVersions() && app_util.checkFile() && app_util.checkService()) {
                    engines.execScriptFile("modules/import_labels.js", {delay: 500});
                    app_util.stopScript();
                }
            }).show();
        }
    });

    ui.test_friends_button.on("click", () => {
        app_util.testFriends();
    });
})();