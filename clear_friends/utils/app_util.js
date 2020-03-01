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
        let min_le_middle = middle_le_max = true;
        for (let i = 0; i < min_supported_version.length || i < current_version.length; i++) {
            let min = i < min_supported_version.length ? parseInt(min_supported_version[i]) : 0;
            let middle = i < current_version.length ? parseInt(current_version[i]) : 0;
            if (min < middle) {
                break;
            } else if (min > middle) {
                min_le_middle = false;
                break;
            }
        }
        for (let i = 0; i < current_version.length || i < max_supported_version.length; i++) {
            let middle = i < current_version.length ? parseInt(current_version[i]) : 0;
            let max = i < max_supported_version.length ? parseInt(max_supported_version[i]) : 0;
            if (middle < max) {
                break;
            } else if (middle > max) {
                middle_le_max = false;
                break;
            }
        }
        return min_le_middle && middle_le_max;
    }
}