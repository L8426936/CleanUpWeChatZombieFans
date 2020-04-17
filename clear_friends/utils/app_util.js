module.exports = {
    /**
     * 获取app版本号
     * @param {string} package_name app包名
     * @returns {string} app包名不存在，返回null
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
     * 检查是否支持该版本的app，仅支持 \d+(\.\d+)? 的格式
     * @param {string} current_version
     * @param {string} min_supported_version
     * @param {string} max_supported_version
     * @returns {boolean} 支持返回true
     */
    isSupportVersion: (current_version, min_supported_version, max_supported_version) => {
        let min_supported_version_arr = min_supported_version.match(/\d+/g);
        let current_version_arr = current_version.match(/\d+/g);
        let max_supported_version_arr = max_supported_version.match(/\d+/g);
        for (let i = 0; i < min_supported_version_arr.length || i < current_version_arr.length; i++) {
            let min = i < min_supported_version_arr.length ? parseInt(min_supported_version_arr[i]) : 0;
            let middle = i < current_version_arr.length ? parseInt(current_version_arr[i]) : 0;
            if (min < middle) {
                break;
            } else if (min > middle) {
                return false;
            }
        }
        for (let i = 0; i < current_version_arr.length || i < max_supported_version_arr.length; i++) {
            let middle = i < current_version_arr.length ? parseInt(current_version_arr[i]) : 0;
            let max = i < max_supported_version_arr.length ? parseInt(max_supported_version_arr[i]) : 0;
            if (middle < max) {
                break;
            } else if (middle > max) {
                return false;
            }
        }
        return true;
    }
}