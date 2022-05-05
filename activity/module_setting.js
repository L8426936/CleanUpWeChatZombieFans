"ui";
(() => {
    ui.layout(
        <vertical padding="8">
            <horizontal w="*">
                <text id="operate_step_text" layout_weight="1" layout_gravity="center" gravity="center" />
                <text id="widget_operate_text" w="32" gravity="center" />
                <text id="coordinate_operate_text" w="32" gravity="center" />
                <text id="delay_operate_text" w="32" gravity="center" />
            </horizontal>
            <list id="method_list">
                <horizontal w="*">
                    <text id="operate_step_text" layout_weight="1" layout_gravity="center" gravity="center" text="{{operate_step}}" />
                    <checkbox id="widget_checkbox" checked="{{widget}}" />
                    <checkbox id="coordinate_checkbox" checked="{{coordinate}}" />
                    <checkbox id="delay_checkbox" checked="{{delay}}" />
                </horizontal>
            </list>
        </vertical>
    );

    let language, running_config;

    /**
     * 初始化配置
     */
     function init() {
        let app_util = require("utils/app_util.js");
        language = app_util.getLanguage();
        running_config = app_util.getRunningConfig();

        ui.operate_step_text.setMovementMethod(android.text.method.LinkMovementMethod.getInstance());
        ui.operate_step_text.setText(android.text.Html.fromHtml(language["operate_step"], android.text.Html.FROM_HTML_MODE_COMPACT));
        ui.widget_operate_text.setText(language["widget_operate"]);
        ui.coordinate_operate_text.setText(language["coordinate_operate"]);
        ui.delay_operate_text.setText(language["delay_operate"]);


        let method_list = [];
        for (let method of running_config[running_config["module"]]) {
            let new_method = {};
            Object.assign(new_method, method);
            new_method["operate_step"] = language[method["function_name"]];
            method_list.push(new_method);
        }
        ui.method_list.setDataSource(method_list);
    }
    init();

    function saveModuleSetting(item) {
        for (let method of running_config[running_config["module"]]) {
            if (method["function_name"] == item["function_name"]) {
                method["widget"] = item["widget"];
                method["coordinate"] = item["coordinate"];
                method["delay"] = item["delay"];
                break;
            }
        }
        files.write("config/running_config.json", JSON.stringify(running_config));
    }

    ui.method_list.on("item_bind", (itemView, itemHolder) => {
        itemView.widget_checkbox.on("click", view => {
            itemHolder.item.widget = view.checked;
            saveModuleSetting(itemHolder.item);
        });
        itemView.coordinate_checkbox.on("click", view => {
            itemHolder.item.coordinate = view.checked;
            saveModuleSetting(itemHolder.item);
        });
        itemView.delay_checkbox.on("click", view => {
            itemHolder.item.delay = view.checked;
            saveModuleSetting(itemHolder.item);
        });
    });

})();