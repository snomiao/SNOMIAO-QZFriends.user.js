# QQ好友管理套件
导出 QQ 好友列表到`Excel`、`JSON`、`TSV`、`CSV`、输出 `.lnk` 或 `.url` 链接快速打开好友的聊天窗口. 



## 快速上手

### 取得好友列表
1. 安装这个用户脚本 `QQ空间一键获取自己的好友列表JSON.user.js`
2. 登录 QQ 空间。
3. 点击 获取好友列表 JSON
   ![获取好友列表JSON按钮](./获取好友列表JSON按钮.png)

## 原理 & 制作笔记

### 取得好友列表
QQ空间发说说的地方会打开好友列表

### 快速打开某位 QQ 好友

在不同设备上自动打开 QQ 有不同的方式

| 端 | 链接 |
|-|-|
| Web-(Windows) | `http://wpa.qq.com/msgrd?v=3&uin=${uin}&site=qq&menu=yes` |
| Windows | `tencent://Message/?Menu=yes&Uin=${uin}` |
| Android | `mqq://im/chat?chat_type=wpa&version=1&src_type=web&uin=${uin}` |
| IOS | `mqqwpa://im/chat?chat_type=wpa&uin=${uin}` |
`"C:\Program Files (x86)\Tencent\QQ\Bin\QQScLauncher.exe" /uin:997596439 /quicklunch:3FC21656CAA53DB1B602BDCA1D6AA5998B0AF1C65935537DF954D44EC491AC1D40204E453947502C`


#### 输出 .lnk 文件
[windows-shortcuts - npm]( https://www.npmjs.com/package/windows-shortcuts )。
雪星最早是用这个包来输出 lnk 文件，不过由于它在实现上有调用外部exe，并且还有个小 bug 就是不支持一部分 emoji 文件名的输出，不过可以用再改名的方式解决。
.lnk 文件还有个优点就是可以嵌入图标，也就是能做到在图标上加载好友的 QQ 头像（需要爬下来）。

#### 输出 .url 文件
If you open the .url file in a text editor it has the following content:

```ini
[InternetShortcut]
URL=http://stackoverflow.com/questions/4974151/windows-shortcut-lnk-url-parser-for-shortcut-urls
```
好友列表URL打包输出
Should be easy enough to parse.
然后用这个库 urlfile 库来输出为 .url 文件
### 打包


### 快速检索

然后现在你就可以使用 Listary、Everything 搜索QQ好友的：备注、昵称、QQ号、来快速打开某位好友的聊天窗口了。

## 平台兼容性测试（请PR）
[x] Windows
[ ] Mac
[ ] Wine

## 参考文章：
1. [QQ空间g_tk算法的JS脚本的获取和分析_gsls200808的专栏-CSDN博客_g_tk]( https://blog.csdn.net/gsls200808/article/details/48209917 )
2. [javascript - Failed to execute 'btoa' on 'Window': The string to be encoded contains characters outside of the Latin1 range. - Stack Overflow]( https://stackoverflow.com/questions/23223718/failed-to-execute-btoa-on-window-the-string-to-be-encoded-contains-characte )
3. [java - Windows shortcut (.lnk .url) parser for shortcut URL's - Stack Overflow]( https://stackoverflow.com/questions/4974151/windows-shortcut-lnk-url-parser-for-shortcut-urls )
