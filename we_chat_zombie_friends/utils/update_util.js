module.exports = (() => {

    let base_url = "https://gitee.com/L8426936/auto.js-script/raw/master/we_chat_zombie_friends/";

    function readRemoteProject() {
        let remote_project;
        let project_result = download(base_url + "project.json");
        if (project_result["success"]) {
            remote_project = JSON.parse(project_result["content"]);
        }
        return remote_project;
    }

    /**
     * 校验是否有更新
     * @returns
     */
    function checkUpdate() {
        let remote_project = readRemoteProject();
        if (remote_project != undefined) {
            let local_project = JSON.parse(files.read("project.json"));
            return local_project["versionCode"] < remote_project["versionCode"];
        }
        return false;
    }

    /**
     * 更新文件
     */
    function update(dialog) {
        let download_all_file = true;
        if (checkUpdate()) {
            let remote_project = readRemoteProject();
            if (remote_project != undefined) {
                let local_project = JSON.parse(files.read("project.json"));
                let remote_files_md5 = remote_project["files_md5"];
                let local_files_md5 = local_project["files_md5"];
                let diff_file_count = 0;
                for (let key in remote_files_md5) {
                    if (local_files_md5[key] == undefined || local_files_md5[key] != remote_files_md5[key]) {
                        diff_file_count++;
                    }
                }
                let count = 1;
                for (let key in remote_files_md5) {
                    if (local_files_md5[key] == undefined || local_files_md5[key] != remote_files_md5[key]) {
                        let result = download(base_url + key);
                        if (result["success"]) {
                            dialog.progress = 100 * count++ / diff_file_count;
                            files.createWithDirs(".download_files/" + key);
                            files.write(".download_files/" + key, result["content"]);
                        } else {
                            download_all_file = false;
                        }
                    }
                }
                if (download_all_file) {
                    for (let key in remote_files_md5) {
                        if (local_files_md5[key] == undefined || local_files_md5[key] != remote_files_md5[key]) {
                            files.copy(".download_files/" + key, key);
                        }
                    }
                    files.removeDir(".download_files/");
                }
            } else {
                download_all_file = false;
            }
        }
        return download_all_file;
    }

    function download(url) {
        let content, success = false, keep = true;
        http.get(url, {}, function (res, err) {
            if (err) {
                log(err);
            } else {
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