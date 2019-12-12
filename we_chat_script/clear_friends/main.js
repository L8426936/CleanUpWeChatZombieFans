"ui";

const CONFIG = require("./config.js");
const COMMON = require("./common.js");

ui.layout(
    <frame padding="8">
        <vertical>
            <list id="list" marginBottom="64">
                <horizontal padding="0 8">
                    <checkbox id="single_assertion_friend_checkbox" layout_gravity="center" checked="{{is_delete}}"/>
                    <vertical>
                        <text text="{{we_chat_name}}"/>
                        <text text="{{friend_nickname}}"/>
                        <text text="{{assertion}}"/>
                    </vertical>
                </horizontal>
            </list>
        </vertical>
        <horizontal>
            <button id="clear_abnormal_friends" layout_weight="1" layout_gravity="bottom" style="Widget.AppCompat.Button.Colored" textStyle="bold" text="清除本地数据"/>
            <button id="delete_button" layout_weight="1" layout_gravity="bottom" textColor="red" style="Widget.AppCompat.Button.Colored" textStyle="bold" text="开始删除"/>
            <button id="assertion_button" layout_weight="1" layout_gravity="bottom" textColor="green" style="Widget.AppCompat.Button.Colored" textStyle="bold" text="开始标记"/>
        </horizontal>
    </frame>
);

const BASE_PATH = files.cwd();

var abnormal_friends = {}, is_delete_count = 0;

function init() {
    abnormal_friends = COMMON.getAbnormalFriends();
    let list_data = [];
    for (let we_chat_name of Object.keys(abnormal_friends)) {
        list_data.push(abnormal_friends[we_chat_name]);
    }
    ui.list.setDataSource(list_data);
    if (list_data.length > 0) {
        ui.clear_abnormal_friends.enabled = true;
        ui.delete_button.enabled = true;
    } else {
        ui.clear_abnormal_friends.enabled = false;
        ui.delete_button.enabled = false;
    }
}

init();

ui.emitter.on("resume", init);

ui.list.on("item_bind", (itemView, itemHolder) => {
    itemView.single_assertion_friend_checkbox.on("check", (checked) => {
        let item = itemHolder.item;
        is_delete_count = checked ? is_delete_count + 1 : is_delete_count - 1;
        if (abnormal_friends[item.we_chat_name].is_delete != checked) {
            abnormal_friends[item.we_chat_name].is_delete = checked;
            COMMON.putAbnormalFriends(abnormal_friends);
        }
    });
    itemView.single_assertion_friend_checkbox.on("click", () => {
        let item = itemHolder.item;
        let assertion = item.assertion;
        let checked = itemView.single_assertion_friend_checkbox.checked;
        if (checked && assertion != "请确认你和他（她）的好友关系是否正常" && assertion != "你不是收款方好友，对方添加你为好友后才能发起转账") {
            dialogs.build({
                content: "对方没有拉黑或删除你，确定将对方加入待删除名单？",
                positive: "确定",
                negative: "取消"
            }).on("positive", () => {
            }).on("cancel", () => {
                itemView.single_assertion_friend_checkbox.checked = false;
            }).show();
        }
    });
});

ui.clear_abnormal_friends.on("click", () => {
    COMMON.putAbnormalFriends({});
    init();
});

ui.delete_button.on("click", () => {
    if (is_delete_count > 0) {
        dialogs.build({
            title: "危险操作！！！",
            titleColor: "red",
            content: "删除选中的好友",
            positive: "确定",
            negative: "取消"
        }).on("positive", () => {
            engines.execScriptFile(BASE_PATH + "/delete_abnormal_friends.js");
        }).on("cancel", () => {
        }).show();
    } else {
        toast("至少勾选一个复选框");
    }
});

ui.assertion_button.on("click", () => {
    engines.execScriptFile(BASE_PATH + "/assertion_friends.js");
});