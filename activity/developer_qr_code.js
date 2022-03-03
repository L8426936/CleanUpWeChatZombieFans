"ui";
(() => {
    ui.layout(
        <vertical padding="20">
            <img id ="qr_code" layout_weight="1"/>
            <text id="info" gravity="center"/>
            <radiogroup id="radiogroup" orientation="horizontal" gravity="center">
                <radio id="radio1" checked="true"/>
                <radio id="radio2"/>
            </radiogroup>
        </vertical>
    );

    let base_url = "https://gitee.com/L8426936/CleanUpWeChatZombieFans/raw/master/res/";
    // 本地测试使用
    // let base_url = "http://192.168.123.105/auto.js-script/CleanUpWeChatZombieFans/res/";
    let app_util, language, running_config;

    /**
     * 初始化配置
     */
    function init() {
        app_util = require("utils/app_util.js");
        language = app_util.getLanguage();
        running_config = app_util.getRunningConfig();
    }
    init();

    /**
     * 初始化UI
     */
    function initUI() {
        if (running_config["developer_qr_code_type"] == "contact") {
            ui.radio1.setText(language["qq"]);
            downloadQRCode("qq.png");
        } else {
            ui.radio1.setText(language["ali_pay"]);
            downloadQRCode("alipay.png");
        }
        ui.radio2.setText(language["we_chat"]);
    }
    initUI();

    ui.radiogroup.setOnCheckedChangeListener({
        onCheckedChanged: (group, checkedId) => {
            if (running_config["developer_qr_code_type"] == "contact") {
                if (group.getChildAt(0).isChecked()) {
                    downloadQRCode("qq.png");
                } else {
                    downloadQRCode("wechat.png");
    
                }
            } else {
                if (group.getChildAt(0).isChecked()) {
                    downloadQRCode("alipay.png");
                } else {
                    downloadQRCode("wechatpay.png");
                }
            }
        }
    });

    function downloadQRCode(part_url) {
        ui.radio1.setEnabled(false);
        ui.radio2.setEnabled(false);
        ui.qr_code.setImageBitmap(null);
        ui.info.setText(language["downloading"]);
        http.get(base_url + part_url, {}, (res, err) => {
            if (err || res["statusCode"] != 200) {
                ui.run(() => {
                    ui.info.setText(language["download_fail"]);
                });
            } else {
                let bytes = res.body.bytes();
                ui.run(() => {
                    ui.qr_code.setImageBitmap(android.graphics.BitmapFactory.decodeByteArray(bytes, 0, bytes.length));
                    ui.info.setText("");
                });
            }
            ui.run(() => {
                ui.radio1.setEnabled(true);
                ui.radio2.setEnabled(true);
            });
        });
    }
})();