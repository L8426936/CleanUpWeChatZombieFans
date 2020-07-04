"ui";
(() => {
    ui.layout(
        <vertical>
            <list id="label_whitelist" layout_weight="1">
                <horizontal padding="8" w="*">
                    <text text="{{label}}" layout_weight="1"/>
                    <Switch id="ignored_switch" checked="{{ignored}}"/>
                </horizontal>
            </list>
            <horizontal bg="#EBEBEB">
                <button id="clear_labels_button" layout_weight="1" textColor="#CC0000" style="Widget.AppCompat.Button.Borderless" textStyle="bold"/>
                <button id="import_labels_button" layout_weight="1" textColor="#008274" style="Widget.AppCompat.Button.Borderless" textStyle="bold"/>
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
        language = JSON.parse(files.read("config/languages/" + app_util.localLanguage() + ".json"));

        ui.clear_labels_button.setText(language["clear_label"]);
        ui.import_labels_button.setText(language["import_label"]);

        if (!app_util.checkSupportedLanguage()) {
            ui.import_labels_button.enabled = false;
            ui.import_labels_button.textColor = colors.parseColor("#B2B2B2");
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
            initUI();
        }).show();
    });
    
    ui.import_labels_button.on("click", () => {
        if (app_util.checkInstalledWeChat() && app_util.checkSupportedWeChatVersion() && app_util.checkFile() && app_util.checkService()) {
            dialogs.build({
                content: language["before_running_alert_dialog_message"],
                positive: language["confirm"],
                positiveColor: "#008274",
                negative: language["cancel"],
                negativeColor: "#008274",
                cancelable: false
            }).on("positive", () => {
                engines.execScriptFile("modules/import_labels.js", {delay: 500});
                app_util.stopScript();
            }).show();
        }
    });
})();