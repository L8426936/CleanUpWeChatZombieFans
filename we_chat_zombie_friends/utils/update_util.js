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
            for (let i = 0, count = 1; i < remote_project["files"].length; i++) {
                let file_path = remote_project["files"][i];
                let result = download(base_url + file_path);
                if (result["success"]) {
                    dialog.progress = 100 * count++ / remote_project["files"].length;
                    files.createWithDirs(".download_files/" + file_path);
                    files.write(".download_files/" + file_path, result["content"]);
                } else {
                    download_all_file = false;
                }
            }
            if (download_all_file) {
                for (let i = 0; i < remote_project["files"].length; i++) {
                    let file_path = remote_project["files"][i];
                    files.copy(".download_files/" + file_path, file_path);
                }
                files.removeDir(".download_files/");
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