"ui";
(() => {
    ui.layout(
        <vertical padding="8">
            <checkbox id="manual_control_we_chat_release_source" />
            <checkbox id="no_more_warning" />
            <checkbox id="auto_update" />
            <checkbox id="reboot_script" />
            <text id="accumulator_delay_duration_text" gravity="center" />
            <seekbar id="accumulator_delay_duration_seekbar" max="5" />
            <text id="click_delay_duration_text" gravity="center" />
            <seekbar id="click_delay_duration_seekbar" max="90" />
            <text id="find_delay_duration_text" gravity="center" />
            <seekbar id="find_delay_duration_seekbar" max="250" />
            <text id="log_level_text" gravity="center" />
            <seekbar id="log_level_seekbar" max="7" />
            <horizontal>
                <button id="delete_log" layout_weight="1" style="Widget.AppCompat.Button.Colored" />
                <button id="share_log" layout_weight="1" style="Widget.AppCompat.Button.Colored" />
            </horizontal>
        </vertical>
    );

    let language, running_config;
    let log_level = ["ALL", "TRACE", "DEBUG", "INFO", "WARN", "ERROR", "FATAL", "OFF"];

    /**
     * 初始化配置
     */
    function init() {
        let app_util = require("utils/app_util.js");
        language = app_util.getLanguage();
        running_config = app_util.getRunningConfig();

        ui.manual_control_we_chat_release_source.setText(language["manual_control_we_chat_release_source"]);
        ui.manual_control_we_chat_release_source.setChecked(running_config["manual_control_we_chat_release_source"]);
        ui.manual_control_we_chat_release_source.setEnabled(!!(app_util.getWeChatReleaseSourceByApplication()));

        ui.no_more_warning.setText(language["no_more_warning"]);
        ui.no_more_warning.setChecked(running_config["no_more_warning"]);

        ui.auto_update.setText(language["auto_update"]);
        ui.auto_update.setChecked(running_config["auto_update"]);

        ui.reboot_script.setText(language["reboot_script"].replace("%time%", running_config["accumulator_delay_duration"] / 1000));
        ui.reboot_script.setChecked(running_config["reboot_script"]);

        ui.accumulator_delay_duration_text.setText(language["accumulator_delay_duration"].replace("%time%", running_config["accumulator_delay_duration"] / 1000));
        ui.accumulator_delay_duration_seekbar.setProgress((running_config["accumulator_delay_duration"] - 10000) / 1000);

        ui.click_delay_duration_text.setText(language["click_delay_duration"].replace("%click_delay_duration%", running_config["click_delay_duration"] / 1000));
        ui.click_delay_duration_seekbar.setProgress((running_config["click_delay_duration"] - 100) / 10);

        ui.find_delay_duration_text.setText(language["find_delay_duration"].replace("%find_delay_duration%", running_config["find_delay_duration"] / 1000));
        ui.find_delay_duration_seekbar.setProgress((running_config["find_delay_duration"] - 500) / 10);

        ui.log_level_text.setText(language["log_level"].replace("%log_level%", log_level[running_config["log_level"]]));
        ui.log_level_seekbar.setProgress(running_config["log_level"]);

        ui.delete_log.setText(language["delete_log"]);
        ui.delete_log.setEnabled(files.exists("logs/log.log"));

        ui.share_log.setText(language["share_log"]);
        ui.share_log.setEnabled(files.exists("logs/log.log"));
    }
    init();

    ui.manual_control_we_chat_release_source.on("check", checked => {
        running_config["manual_control_we_chat_release_source"] = checked;
        files.write("config/running_config.json", JSON.stringify(running_config));
    });

    ui.no_more_warning.on("check", checked => {
        running_config["no_more_warning"] = checked;
        files.write("config/running_config.json", JSON.stringify(running_config));
    });

    ui.auto_update.on("check", checked => {
        running_config["auto_update"] = checked;
        files.write("config/running_config.json", JSON.stringify(running_config));
    });

    ui.reboot_script.on("check", checked => {
        running_config["reboot_script"] = checked;
        files.write("config/running_config.json", JSON.stringify(running_config));
    });

    ui.accumulator_delay_duration_seekbar.setOnSeekBarChangeListener({
        onProgressChanged: (seekbar, progress, from_user) => {
            if (from_user) {
                running_config["accumulator_delay_duration"] = (progress + 10) * 1000;
                files.write("config/running_config.json", JSON.stringify(running_config));
                ui.accumulator_delay_duration_text.setText(language["accumulator_delay_duration"].replace("%time%", running_config["accumulator_delay_duration"] / 1000));
                ui.reboot_script.setText(language["reboot_script"].replace("%time%", running_config["accumulator_delay_duration"] / 1000));
            }
        }
    });

    ui.click_delay_duration_seekbar.setOnSeekBarChangeListener({
        onProgressChanged: (seekbar, progress, from_user) => {
            if (from_user) {
                running_config["click_delay_duration"] = (progress + 10) * 10;
                files.write("config/running_config.json", JSON.stringify(running_config));
                ui.click_delay_duration_text.setText(language["click_delay_duration"].replace("%click_delay_duration%", running_config["click_delay_duration"] / 1000));
            }
        }
    });

    ui.find_delay_duration_seekbar.setOnSeekBarChangeListener({
        onProgressChanged: (seekbar, progress, from_user) => {
            if (from_user) {
                running_config["find_delay_duration"] = (progress + 50) * 10;
                files.write("config/running_config.json", JSON.stringify(running_config));
                ui.find_delay_duration_text.setText(language["find_delay_duration"].replace("%find_delay_duration%", running_config["find_delay_duration"] / 1000));
            }
        }
    });

    ui.log_level_seekbar.setOnSeekBarChangeListener({
        onProgressChanged: (seekbar, progress, from_user) => {
            if (from_user) {
                running_config["log_level"] = progress;
                files.write("config/running_config.json", JSON.stringify(running_config));
                ui.log_level_text.setText(language["log_level"].replace("%log_level%", log_level[progress]));
            }
        }
    });

    ui.delete_log.on("click", () => {
        if (files.remove("logs/log.log")) {
            ui.delete_log.setEnabled(files.exists("logs/log.log"));
            ui.share_log.setEnabled(files.exists("logs/log.log"));
            toast(language["deleted"]);
        }
    });

    ui.share_log.on("click", () => {
        app.startActivity({
            action: "android.intent.action.SEND",
            type: "*/*",
            extras: {
                "android.intent.extra.STREAM": app.getUriForFile("logs/log.log")
            }
        });
    });

})();