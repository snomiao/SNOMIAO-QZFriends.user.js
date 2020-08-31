# 雪喵空友列 - QQ 好友导出备份管理套件

导出 QQ 好友列表到 `Excel`、`JSON`、`TSV`、`CSV`、输出 `.url` 链接快速打开好友的聊天窗口。（Mac QQ 暂不可用）

## 一、快速上手

### 安装脚本

Greasy fork 链接：
[https://greasyfork.org/zh-CN/scripts/406982-雪喵空友列-qq-空间一键获取自己的好友列表](https://greasyfork.org/zh-CN/scripts/406982-%E9%9B%AA%E5%96%B5%E7%A9%BA%E5%8F%8B%E5%88%97-qq-%E7%A9%BA%E9%97%B4%E4%B8%80%E9%94%AE%E8%8E%B7%E5%8F%96%E8%87%AA%E5%B7%B1%E7%9A%84%E5%A5%BD%E5%8F%8B%E5%88%97%E8%A1%A8)

### 取得好友列表
1. 安装上述用户脚本
2. 登录 QQ 空间。
3. 点击 `获取好友列表JSON` 如图
   
   ![获取好友列表JSON按钮](./获取好友列表JSON按钮.png)

## 二、原理 & 制作笔记

### 取得好友列表

QQ空间发说说的地方会打开好友列表，顺着它的 API 调用就可以弄到好友列表的 jsonp，再进行一些转换，使数据格式便于使用即可。

### 如何快速打开某位 QQ 好友的聊天窗口

在不同设备上自动打开 QQ 好友窗口有不同的方式，见下表

| 端 | 链接 |
|-|-|
| Web-(Windows) | `http://wpa.qq.com/msgrd?v=3&uin=${uin}&site=qq&menu=yes` |
| Windows | `tencent://Message/?Menu=yes&Uin=${uin}` |
| Android | `mqq://im/chat?chat_type=wpa&version=1&src_type=web&uin=${uin}` |
| IOS | `mqqwpa://im/chat?chat_type=wpa&uin=${uin}` |

#### 输出 .lnk 文件（仅 windows）

[windows-shortcuts - npm]( https://www.npmjs.com/package/windows-shortcuts )。
雪星最早是用这个包来输出 lnk 文件，不过由于它在实现上有调用外部exe，并且还有个小 bug 就是不支持一部分 emoji 文件名的输出，不过可以用再改名的方式解决。
.lnk 文件还有个优点就是可以嵌入图标，也就是能做到在图标上加载好友的 QQ 头像（需要爬下来）。

#### 输出 .url 文件（Win可以，mac理论可以但未测试）

If you open the .url file in a text editor it has the following content:

```ini
[InternetShortcut]
URL=http://stackoverflow.com/questions/4974151/windows-shortcut-lnk-url-parser-for-shortcut-urls
```
好友列表URL打包输出
Should be easy enough to parse.
然后用这个库 urlfile 库来输出为 .url 文件

### 打包

加个 jszip 库就可以了

### 快速检索

然后现在你就可以使用 Listary、Everything 搜索QQ好友的：备注、昵称、QQ号、来快速打开某位好友的聊天窗口了。

## 三、平台兼容性测试（请PR）

- [x] Windows
- [ ] Mac
- [ ] Wine

## 四、参考：

1. [QQ空间g_tk算法的JS脚本的获取和分析_gsls200808的专栏-CSDN博客_g_tk]( https://blog.csdn.net/gsls200808/article/details/48209917 )
2. [javascript - Failed to execute 'btoa' on 'Window': The string to be encoded contains characters outside of the Latin1 range. - Stack Overflow]( https://stackoverflow.com/questions/23223718/failed-to-execute-btoa-on-window-the-string-to-be-encoded-contains-characte )
3. [java - Windows shortcut (.lnk .url) parser for shortcut URL's - Stack Overflow]( https://stackoverflow.com/questions/4974151/windows-shortcut-lnk-url-parser-for-shortcut-urls )
4. [QQ好友列表数据获取 - 知乎]( https://zhuanlan.zhihu.com/p/24580113 )
5. [python 记一次计算qzonetoken经历_Hello_Seattle的专栏-CSDN博客]( https://blog.csdn.net/Hello_Seattle/article/details/55281869 )