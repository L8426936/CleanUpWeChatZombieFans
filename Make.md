# 清理微信僵尸粉控件id文件制作教程
## 微信更新，控件id不变
微信小版本更新，一般控件id不会改变，无需制作控件id文件，只需简单修改[config.json](config/config.json)文件即可。

google_play_store：谷歌版微信  
other：中国版微信  
min_supported_versions：支持的最低版微信  
max_supported_versions：支持的最高版微信  
"8.0.6-8.0.7": "e2df1dfcee6a5dd7f84280cedf2e88fc.json"：中国版微信8.0.6-8.0.7版本的控件id文件是e2df1dfcee6a5dd7f84280cedf2e88fc.json
```
"supported_we_chat_versions": {
    "google_play_store": {
        "min_supported_versions": "7.0.16",
        "max_supported_versions": "7.0.21"
    },
    "other": {
        "min_supported_versions": "7.0.15",
        "max_supported_versions": "8.0.7"
    }
},
"ids_versions": {
    "google_play_store": {
        "7.0.16-7.0.16": "b5b82a06a78db5de98a0e050049af5bb.json",
        "7.0.17-7.0.17": "57ade286ab5663088f15ab2f0b9ff14b.json",
        "7.0.21-7.0.21": "ac0741a4e5f57b2f88610ebb148948cd.json"
    },
    "other": {
        "7.0.15-7.0.22": "6139b2e741010120c2221a8f0a19a1d1.json",
        "8.0.0-8.0.3": "e2df1dfcee6a5dd7f84280cedf2e88fc.json",
        "8.0.6-8.0.7": "e2df1dfcee6a5dd7f84280cedf2e88fc.json"
    }
}
```
### 修改示例（假设中国版微信下次发布版本为8.0.x）
#### 修改方式一（连续版本建议使用此修改方案）
```
"supported_we_chat_versions": {
    "google_play_store": {
        "min_supported_versions": "7.0.16",
        "max_supported_versions": "7.0.21"
    },
    "other": {
        "min_supported_versions": "7.0.15",
        "max_supported_versions": "8.0.x"
    }
},
"ids_versions": {
    "google_play_store": {
        "7.0.16-7.0.16": "b5b82a06a78db5de98a0e050049af5bb.json",
        "7.0.17-7.0.17": "57ade286ab5663088f15ab2f0b9ff14b.json",
        "7.0.21-7.0.21": "ac0741a4e5f57b2f88610ebb148948cd.json"
    },
    "other": {
        "7.0.15-7.0.22": "6139b2e741010120c2221a8f0a19a1d1.json",
        "8.0.0-8.0.3": "e2df1dfcee6a5dd7f84280cedf2e88fc.json",
        "8.0.6-8.0.x": "e2df1dfcee6a5dd7f84280cedf2e88fc.json"
    }
}
```
#### 修改方式二（不连续版本建议使用此修改方案）
```
"supported_we_chat_versions": {
    "google_play_store": {
        "min_supported_versions": "7.0.16",
        "max_supported_versions": "7.0.21"
    },
    "other": {
        "min_supported_versions": "7.0.15",
        "max_supported_versions": "8.0.x"
    }
},
"ids_versions": {
    "google_play_store": {
        "7.0.16-7.0.16": "b5b82a06a78db5de98a0e050049af5bb.json",
        "7.0.17-7.0.17": "57ade286ab5663088f15ab2f0b9ff14b.json",
        "7.0.21-7.0.21": "ac0741a4e5f57b2f88610ebb148948cd.json"
    },
    "other": {
        "7.0.15-7.0.22": "6139b2e741010120c2221a8f0a19a1d1.json",
        "8.0.0-8.0.3": "e2df1dfcee6a5dd7f84280cedf2e88fc.json",
        "8.0.6-8.0.7": "e2df1dfcee6a5dd7f84280cedf2e88fc.json"
        "8.0.x-8.0.x": "e2df1dfcee6a5dd7f84280cedf2e88fc.json"
    }
}
```
## 微信更新，控件id改变（以下未完成）
### 测试好友功能所需控件id
```
"contacts": "dub",
"friend_list": "h4",
"friend_remark": "ft6",
"contacts_count": "ba5",
"send_message": "ijq",
"friend_details_page_list": "android:id/list",
"we_chat_id": "bd_",
"account_deleted": "bd9",
"back_to_friend_list": "ei",
"switch_message_type": "ax7",
"more_function_by_transfer": "au0",
"transfer_function": "rt",
"payee": "h2k",
"transfer_amount": "jf4",
"confirm_transfer": "e6c",
"abnormal_message": "ffh",
"confirm_abnormal_message": "ffp",
"back_to_chat": "ei",
"back_to_chats": "uo",
```
### 删除好友功能所需控件id
```
"contacts": "dub",
"friend_list": "h4",
"friend_remark": "ft6",
"contacts_count": "ba5",
"we_chat_id": "bd_",
"back_to_friend_list": "ei",
"more_function_by_delete": "d8",
"more_function_by_delete_list": "android:id/list",
"delete": "ijq",
"confirm_delete": "ffp"
```
### 从标签列表导入好友所需控件id
```
"contacts": "dub",
"labels": "hx",
"add_label": "e77",
"label": "e73",
"contacts_count_by_label": "e72",
"friend_remark_by_label": "h8q",
"friend_list_by_label": "android:id/list",
"delete_label": "android:id/title",
"back_to_label_list": "ei",
"label_list": "e75",
"back_to_friend_list": "ei",
```