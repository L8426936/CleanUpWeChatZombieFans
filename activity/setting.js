"ui";
(() => {
    ui.layout(
        <vertical padding="8">
            <checkbox id="manual_control_we_chat_release_source" />
        </vertical>
    );

    let language, running_config;

    /**
     * 初始化配置
     */
    function init() {
        let app_util = require("utils/app_util.js");
        language = app_util.getLanguage();
        running_config = app_util.getRunningConfig();

        ui.manual_control_we_chat_release_source.setText(language["manual_control_we_chat_release_source"]);
        ui.manual_control_we_chat_release_source.checked = running_config["manual_control_we_chat_release_source"];
        ui.manual_control_we_chat_release_source.enabled = !!(app_util.getWeChatReleaseSourceByApplication());
    }
    init();

    ui.manual_control_we_chat_release_source.on("check", checked => {
        running_config["manual_control_we_chat_release_source"] = checked;
        files.write("config/running_config.json", JSON.stringify(running_config));
    });
})();