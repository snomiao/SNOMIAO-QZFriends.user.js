const jsonfile = require("jsonfile");
const fs = require("fs");
const { promisify } = require("util");
const ws = require("windows-shortcuts");

// 在不同的设备上唤起 QQ 有不同的方式，可以由链接方式唤醒如下
const 发起会话URL = {
    桌面通过网页: (uin) =>
        `http://wpa.qq.com/msgrd?v=3&uin=${uin}&site=qq&menu=yes`,
    桌面: (uin) => `tencent://Message/?Menu=yes&Uin=${uin}`,
    安桌: (uin) =>
        `mqq://im/chat?chat_type=wpa&version=1&src_type=web&uin=${uin}`,
    苹果: (uin) => `mqqwpa://im/chat?chat_type=wpa&uin=${uin}`,
};
const 发起QQ会话URL获取 = (uin, 平台 = "桌面") => 发起会话URL[平台](uin);

const ExportQQFriendsJsonToLNKs = async (jsonContents, outputLnkFolder) => {
    const e = jsonContents;
    const 元 = e.data;
    const 分组名表 = Object.fromEntries(元.gpnames.map(({ gpid, gpname }) => [gpid, gpname]));
    // 创建分组文件夹
    Object.values(分组名表).map((e) =>
        fs.mkdirSync(outputLnkFolder + e, { recursive: true })
    );
    const 参数 = 元.items
        // 根据好友信息生成 lnk 信息
        .map(({ name, remark, uin, groupid }) => ({
            url: 发起QQ会话URL获取(uin),
            lnkpath:
                outputLnkFolder +
                [
                    分组名表[groupid],
                    `${
                    remark && remark !== name ? "@" + remark : ""
                    }@${name}(${uin}@qq.com).lnk`,
                ]
                    .map((e) =>
                        e
                            .toString()
                            //去掉文件名里不允许出现的特殊字符
                            .replace(/[\<\>\:\?\$\%\^\&\*\\\/\'\"\;\|\~\t\r\n-]+/g, "-")
                    )
                    .join("/"),
            tempfile: outputLnkFolder + `TEMP(${uin}@qq.com).lnk`,
        }));
    // .slice(0, 5) // 小规模测试
    // 输出 lnk
    const 输出 = await Promise.all(
        参数.map(async ({ url, lnkpath, tempfile }) => {
            // 这个 ws.create 直接创建有特殊字符的文件会失败，所以先创建一个普通的
            await promisify(ws.create)(tempfile, url);
            // 然后再改名。
            await promisify(fs.rename)(tempfile, lnkpath);
            return "succ: " + lnkpath;
        })
    );
    console.log(输出);
};

export default ExportQQFriendsJsonToLNKs;

// 运行
if (!module.parent)
    (async () => {
        // config
        var outputLnkFolder = `./output/`;
        var inputJSON = `./data/friends.json`;

        jsonfile
            .readFile(inputJSON)
            .then((json) => ExportQQFriendsJsonToLNKs(json, outputLnkFolder));
    }).catch(console.error);
