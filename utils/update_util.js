module.exports = (() => {

    let base_url = "https://gitee.com/L8426936/CleanUpWeChatZombieFans/raw/master/";
    // 本地测试使用
    // let base_url = "http://192.168.123.105/auto.js-script/CleanUpWeChatZombieFans/";

    /**
     * 校验是否有更新
     * @returns
     */
    function checkUpdate() {
        let project_result = download(base_url + "project.json");
        if (project_result["success"] && files.exists("project.json")) {
            let remote_project = JSON.parse(project_result["content"]);
            let local_project = JSON.parse(files.read("project.json"));
            return local_project["versionCode"] < remote_project["versionCode"];
        }
        return undefined;
    }

    /**
     * 更新文件
     */
    function update() {
        let remote_files_md5_result = download(base_url + "config/files_md5.json");
        let completed_all_file = remote_files_md5_result["success"];
        if (remote_files_md5_result["success"]) {
            let remote_files_md5 = JSON.parse(remote_files_md5_result["content"]);
            let local_files_md5 = files.exists("config/files_md5.json") ? JSON.parse(files.read("config/files_md5.json")) : {};
            let diff_file_count = 0;
            for (let key in remote_files_md5) {
                if (local_files_md5[key] == undefined || local_files_md5[key] != remote_files_md5[key]) {
                    diff_file_count++;
                }
            }
            let dialog = dialogs.build({
                progress: {
                    max: 100,
                    showMinMax: true
                },
                cancelable: false
            }).show();
            let count = 1;
            for (let key in remote_files_md5) {
                if (local_files_md5[key] == undefined || local_files_md5[key] != remote_files_md5[key]) {
                    let result = download(base_url + key);
                    if (result["success"]) {
                        dialog.progress = 100 * count++ / diff_file_count;
                        files.createWithDirs(".download_files/" + key);
                        files.write(".download_files/" + key, result["content"]);
                    } else {
                        completed_all_file = false;
                        break;
                    }
                }
            }
            dialog.dismiss();
            if (completed_all_file) {
                for (let key in remote_files_md5) {
                    if (local_files_md5[key] == undefined || local_files_md5[key] != remote_files_md5[key]) {
                        completed_all_file &= files.copy(".download_files/" + key, key);
                    }
                }
                if (completed_all_file) {
                    for (let key in local_files_md5) {
                        if (remote_files_md5[key] == undefined) {
                            files.remove(key);
                        }
                    }
                }
            }
            files.removeDir(".download_files/");
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
        while (keep) {

        }
        return {content: content, success: success};
    }

    return {checkUpdate: checkUpdate, update: update};
})();