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
    }
}