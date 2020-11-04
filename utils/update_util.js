module.exports = (() => {

    let base_url = "https://gitee.com/L8426936/CleanUpWeChatZombieFans/raw/master/";
    // 本地测试使用
    // let base_url = "http://192.168.123.105/auto.js-script/CleanUpWeChatZombieFans/";

    /**
     * 校验是否有更新
     * @returns
     */
    function remoteConfig() {
        let project_result = download(base_url + "project.json");
        return project_result["success"] ? JSON.parse(project_result["content"]) : null;
    }

    function historyUpdateInfo() {
        let result = download(base_url + "history_update_info.txt");
        return result["success"] ? result["content"] : null;
    }

    function developerQQ() {
        let result = download(base_url + "developer_qq.txt");
        return result["success"] ? result["content"] : null;
    }

    /**
     * 更新文件
     */
    function update() {
        let app_util = require("./app_util.js");
        let language = app_util.getLanguage();
        let keep_download = true, completed_all_file = false;
        let dialog = dialogs.build({
            progress: {
                max: 100,
                showMinMax: true
            },
            negative: language["cancel"],
            cancelable: false
        }).on("negative", () => {
            keep_download = false;
            completed_all_file = false;
            dialog.dismiss();
        }).show();
        let remote_files_md5_result = download(base_url + "config/files_md5.json");
        if (remote_files_md5_result["success"] && keep_download) {
            let remote_files_md5 = JSON.parse(remote_files_md5_result["content"]);
            let local_files_md5 = files.exists("config/files_md5.json") ? JSON.parse(files.read("config/files_md5.json")) : {};
            let diff_file_count = 0;
            for (let key in remote_files_md5) {
                if (local_files_md5[key] != remote_files_md5[key]) {
                    diff_file_count++;
                }
            }
            let count = 1;
            for (let key in remote_files_md5) {
                if (keep_download && local_files_md5[key] != remote_files_md5[key]) {
                    let result = download(base_url + key);
                    if (result["success"]) {
                        dialog.progress = 100 * count++ / diff_file_count;
                        files.createWithDirs(".download_files/" + key);
                        files.write(".download_files/" + key, result["content"]);
                        completed_all_file = true;
                    } else {
                        completed_all_file = false;
                        break;
                    }
                }
            }
            dialog.dismiss();
            if (keep_download && completed_all_file) {
                for (let key in remote_files_md5) {
                    if (local_files_md5[key] != remote_files_md5[key]) {
                        completed_all_file &= files.copy(".download_files/" + key, key);
                    }
                }
                if (completed_all_file) {
                    for (let key in local_files_md5) {
                        if (!remote_files_md5[key]) {
                            files.remove(key);
                        }
                    }
                    toast(language["update_success"]);
                } else {
                    toast(language["update_fail"]);
                }
            } else if (keep_download) {
                toast(language["update_fail"]);
            }
            files.removeDir(".download_files/");
        } else if (keep_download) {
            dialog.dismiss();
            toast(language["update_fail"]);
        }
        return completed_all_file;
    }

    function download(url) {
        let content, success = false, keep = true;
        http.get(url, {}, function (res, err) {
            if (err) {
                log(err);
            } else if (res.statusCode == 200) {
                content = res.body.string();
                success = true;
            }
            keep = false;
        });
        while (keep);
        return {content: content, success: success};
    }

    return {remoteConfig: remoteConfig, historyUpdateInfo: historyUpdateInfo, developerQQ: developerQQ, update: update};
})();