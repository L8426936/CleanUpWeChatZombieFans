module.exports = {
    /**
     * 获取app版本号
     * @param package_name app包名
     * @returns app包名不存在，返回null
     */
    getAppVersion: (package_name) => {
        let app_infos = context.getPackageManager().getInstalledPackages(0).toArray();
        for (let i = 0; i < app_infos.length; i++) {
            if (app_infos[i].packageName == package_name) {
                return app_infos[i].versionName;
            }
        }
        return null;
    },
    /**
     * 检查是否支持该版本的app
     * 
     * 常见的命名方式: major.minor.maintenance.build
     * @returns 支持返回true
     */
    isSupportVersion: () => {
        let min_supported_version = CONFIG.MIN_SUPPORTED_WE_CHAT_VERSION.match(/\d+/g);
        let current_version = module.exports.getAppVersion(CONFIG.WE_CHAT_PACKAGE_NAME).match(/\d+/g);
        let max_supported_version = CONFIG.MAX_SUPPORTED_WE_CHAT_VERSION.match(/\d+/g);
        let min_compare_middle = middle_compare_min = middle_compare_max = max_compare_middle = "";
        for (let i = 0; i < min_supported_version.length || i < current_version.length || i < max_supported_version.length; i++) {
            let min = parseInt(i < min_supported_version.length ? min_supported_version[i] : 0);
            let middle = parseInt(i < current_version.length ? current_version[i] : 0);
            let max = parseInt(i < max_supported_version.length ? max_supported_version[i] : 0);
            if (min > middle) {
                min_compare_middle += "3";
                middle_compare_min += "1";
            } else if (min == middle) {
                min_compare_middle += "2";
                middle_compare_min += "2";
            } else {
                min_compare_middle += "1";
                middle_compare_min += "3";
            }
            if (middle > max) {
                middle_compare_max += "3";
                max_compare_middle += "1";
            } else if (middle == max) {
                middle_compare_max += "2";
                max_compare_middle += "2";
            } else {
                middle_compare_max += "1";
                max_compare_middle += "3";
            }
        }
        return parseInt(min_compare_middle) <= parseInt(middle_compare_min) && parseInt(middle_compare_max) <= parseInt(max_compare_middle);
    }
}