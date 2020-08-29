module.exports = (() => {
    let config = JSON.parse(files.read("config/config.json"));
    let local_language = context.resources.configuration.locale.language + "-" + context.resources.configuration.locale.country;
    let default_language = getLanguage();

    /**
     * 从Google Play Store安装
     * @returns {boolean}
     */
    function isFromGooglePlayStoreByApplication() {
        return context.getPackageManager().getInstallerPackageName(config["we_chat_package_name"]) == "com.android.vending";
    }

    /**
     * 从Google Play Store安装
     * @returns {boolean}
     */
    function isFromGooglePlayStoreByLocation() {
        return isFromGooglePlayStoreByApplication() || getRunningConfig()["is_from_google_play_store"];
    }

    /**
     * 获取app版本号
     * @param {string} package_name app包名
     * @returns {string} app包名不存在，返回null
     */
    function getAppVersions(package_name) {
        return context.getPackageManager().getPackageInfo(package_name, 0).versionName;
    }

    /**
     * 检查是否支持该版本的app，仅支持 \d+(\.\d+)? 的格式
     * @param {string} current_versions
     * @param {string} min_supported_versions
     * @param {string} max_supported_versions
     * @returns {boolean} 支持返回true
     */
    function supportedApplicationVersions(current_versions, min_supported_versions, max_supported_versions) {
        let min_supported_versions_arr = min_supported_versions.match(/\d+/g);
        let current_versions_arr = current_versions.match(/\d+/g);
        let max_supported_versions_arr = max_supported_versions.match(/\d+/g);
        for (let i = 0; i < min_supported_versions_arr.length || i < current_versions_arr.length; i++) {
            let min = i < min_supported_versions_arr.length ? parseInt(min_supported_versions_arr[i]) : 0;
            let middle = i < current_versions_arr.length ? parseInt(current_versions_arr[i]) : 0;
            if (min < middle) {
                break;
            } else if (min > middle) {
                return false;
            }
        }
        for (let i = 0; i < current_versions_arr.length || i < max_supported_versions_arr.length; i++) {
            let middle = i < current_versions_arr.length ? parseInt(current_versions_arr[i]) : 0;
            let max = i < max_supported_versions_arr.length ? parseInt(max_supported_versions_arr[i]) : 0;
            if (middle < max) {
                break;
            } else if (middle > max) {
                return false;
            }
        }
        return true;
    }

    function getLanguage() {
        return JSON.parse(files.read("config/languages/" + (config["supported_languages"].match(local_language) != null ? local_language : "zh-CN") + ".json"));
    }

    function getRunningConfig() {
        return JSON.parse(files.read("config/running_config.json"));
    }

    function getWeChatIds() {
        let ids_versions = isFromGooglePlayStoreByLocation() ? config["ids_versions"]["google_play_store"] : config["ids_versions"]["other"];
        let we_chat_versions = getAppVersions(config["we_chat_package_name"]);
        for (let i = 0; i < ids_versions.length; i++) {
            let supported_versions = ids_versions[i].split("~");
            if (supportedApplicationVersions(we_chat_versions, supported_versions[0], supported_versions[1])) {
                return JSON.parse(files.read("config/text_id/" + (isFromGooglePlayStoreByLocation() ? "google_play_store" : "other") + "/" + ids_versions[i] + ".json"));
            }
        }
    }

    /**
     * 检验语言
     * @returns {boolean}
     */
    function checkSupportedLanguage() {
        return config["supported_languages"].match(local_language) != null;
    }

    /**
     * 校验已安装微信
     * @returns {boolean}
     */
    function checkInstalledWeChat() {
        let installed_we_chat = context.getPackageManager().getPackageInfo(config["we_chat_package_name"], 0) != null;
        if (!installed_we_chat) {
            dialogs.build({
                content: default_language["uninstalled_we_chat_alert_dialog_message"],
                positive: default_language["confirm"],
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
    function checkSupportedWeChatVersions() {
        let supported_we_chat_versions = isFromGooglePlayStoreByLocation() ? config["supported_we_chat_versions"]["google_play_store"] : config["supported_we_chat_versions"]["other"];
        let we_chat_versions = getAppVersions(config["we_chat_package_name"]);
        let min_supported_versions = supported_we_chat_versions["min_supported_versions"];
        let max_supported_versions = supported_we_chat_versions["max_supported_versions"];
        let supported = supportedApplicationVersions(we_chat_versions, min_supported_versions, max_supported_versions);
        if (!supported) {
            dialogs.build({
                content: default_language["unsupported_we_chat_versions_alert_dialog_message"].replace("%min_supported_versions", min_supported_versions).replace("%max_supported_versions", max_supported_versions).replace("%we_chat_versions", we_chat_versions),
                positive: default_language["confirm"],
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
        let we_chat_versions = getAppVersions(config["we_chat_package_name"]);
        let dir = isFromGooglePlayStoreByLocation() ? "google_play_store/" : "other/";
        let ids_versions = isFromGooglePlayStoreByLocation() ? config["ids_versions"]["google_play_store"] : config["ids_versions"]["other"];
        let exists = false, file_path;
        for (let i = 0; !exists && i < ids_versions.length; i++) {
            let supported_versions = ids_versions[i].split("~");
            if (supportedApplicationVersions(we_chat_versions, supported_versions[0], supported_versions[1])) {
                file_path = "config/text_id/" + dir + ids_versions[i] + ".json";
                exists = files.exists(file_path);
                break;
            }
        }
        if (!exists) {
            dialogs.build({
                content: default_language["file_lost_alert_dialog_message"].replace("%file_path", file_path),
                positive: default_language["confirm"],
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
                content: default_language["jump_to_settings_alert_dialog_message"],
                positive: default_language["confirm"],
                positiveColor: "#008274",
                negative: default_language["cancel"],
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

    /**
     * 停止已在运行的脚本，确保单脚本运行
     */
    function stopScript() {
        let scripts = engines.all();
        for (let i = 0; i < scripts.length; i++) {
            if (/.+(main|(activity|modules).+)\.js/.test(scripts[i].getSource().toString())) {
                scripts[i].forceStop();
            }
        }
    }

    /**
     * 检查安装源
     * @param {boolean} checked 
     * @param {Ojbect} running_config 
     */
    function checkInstallSource(checked, running_config) {
        running_config["is_from_google_play_store"] = checked;
        files.write("config/running_config.json", JSON.stringify(running_config));
        if (checkSupportedWeChatVersions() && (checked != isFromGooglePlayStoreByApplication())) {
            toast(default_language["install_source_different_warning"]);
        }
    }

    function testFriends() {
        if (checkInstalledWeChat()) {
            let running_config = getRunningConfig();
            let view = {
                content: default_language["before_running_alert_dialog_message"],
                items: [default_language["label_whitelist_mode"], default_language["label_blacklist_mode"], default_language["friend_whitelist_mode"], default_language["friend_blacklist_mode"]],
                itemsSelectMode: "single",
                itemsSelectedIndex: running_config["test_friend_mode"],
                positive: default_language["confirm"],
                positiveColor: "#008274",
                negative: default_language["cancel"],
                negativeColor: "#008274",
                cancelable: false
            };
            if (!isFromGooglePlayStoreByApplication()) {
                view["checkBoxPrompt"] = default_language["is_from_google_play_store"];
                view["checkBoxChecked"] = isFromGooglePlayStoreByLocation();
            }
            dialogs.build(view)
            .on("single_choice", (index, item) => {
                running_config["test_friend_mode"] = index;
                files.write("config/running_config.json", JSON.stringify(running_config));
            }).on("check", checked => {
                checkInstallSource(checked, running_config);
            }).on("positive", () => {
                if (checkSupportedWeChatVersions() && checkFile() && checkService()) {
                    engines.execScriptFile("modules/test_friends.js", {delay: 500});
                    stopScript();
                }
            }).show();
        }
    }

    return {
        getLanguage: getLanguage,
        getRunningConfig: getRunningConfig,
        getWeChatIds: getWeChatIds,
        checkSupportedLanguage: checkSupportedLanguage,
        checkInstalledWeChat: checkInstalledWeChat,
        checkSupportedWeChatVersions: checkSupportedWeChatVersions,
        checkFile: checkFile,
        checkService: checkService,
        isFromGooglePlayStoreByApplication: isFromGooglePlayStoreByApplication,
        isFromGooglePlayStoreByLocation: isFromGooglePlayStoreByLocation,
        stopScript: stopScript,
        checkInstallSource: checkInstallSource,
        testFriends: testFriends
    };
})();