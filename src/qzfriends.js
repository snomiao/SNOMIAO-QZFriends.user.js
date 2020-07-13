
// 在不同的设备上唤起 QQ 有不同的方式，可以由链接方式唤醒如下

const 发起会话URL = {
    桌面通过网页: (uin) =>
        `http://wpa.qq.com/msgrd?v=3&uin=${uin}&site=qq&menu=yes`,
    桌面: (uin) => `tencent://Message/?Menu=yes&Uin=${uin}`,
    安桌: (uin) =>
        `mqq://im/chat?chat_type=wpa&version=1&src_type=web&uin=${uin}`,
    苹果: (uin) => `mqqwpa://im/chat?chat_type=wpa&uin=${uin}`,
};
exports.小窗URL获取 = (Q号, 平台 = "桌面") => 发起会话URL[平台](Q号);
exports.空间URL获取 = (Q号) => `https://user.qzone.qq.com/${Q号}`

exports.解析 = (json) => {
    const 元 = json.data;
    const 分组名表 = Object.fromEntries(元.gpnames.map(({ gpid, gpname }) => [gpid, gpname]))
    const 友列 = 元.items.map(
        ({ name, remark, uin, groupid }) => {
            const [Q号, 分组, 昵称, 备注] = [uin, ...[分组名表[groupid], name, remark].map(unescape)];
            return { Q号, 分组, 昵称, 备注 }
        })
    return { 分组名表, 友列 }
}
exports.向JSON转换 = (json) => {
    const { 友列 } = this.解析(json)
    return JSON.stringify(友列, null, 4)
}
exports.向TSV转换 = (json) => {
    const { 友列 } = this.解析(json)
    const 输出TSV = ['Q号', '分组', '昵称', '备注'].join('\t') + '\n' +
        友列.map(({ Q号, 分组, 昵称, 备注 }) => [Q号, 分组, 昵称, 备注]
            // TSV 没有转义的定义，不兼容的字符只能直接删掉
            .map(e => e.toString().replace(/\t|\r|\n/g, '_')).join('\t')
        ).join('\n')
    return 输出TSV
}
exports.向CSV转换 = (json) => {
    const { 友列 } = this.解析(json)
    const 输出CSV = ['Q号', '分组', '昵称', '备注'].join(',') + '\n' +
        友列.map(({ Q号, 分组, 昵称, 备注 }) => [Q号, 分组, 昵称, 备注]
            .map(e => e.toString()
                // CSV转义见 [CSV格式特殊字符转义处理_icycode的专栏-CSDN博客_csv 转义]( https://blog.csdn.net/icycode/article/details/80043956 )
                .replace(/(.*?)("|,|\r|\n)(.*)/, (s) => '"' + s.replace(/"/g, '""') + '"')
            ).join(',')
        ).join('\n')
    return 输出CSV
}
const URL文件生成 = (url) => `[InternetShortcut]\nURL=${url}`
exports.向URL文件列转换 = (json) => {
    const { 分组名表, 友列 } = this.解析(json)
    // 替换掉文件名里不允许出现的特殊字符
    const 文件名安全化 = (s) => s.replace(/[\<\>\:\?\$\%\^\&\*\\\/\'\"\;\|\~\t\r\n-]+/g, "-")
    const 文件列 = 友列.map(({ Q号, 分组, 昵称, 备注 }) => {
        [分组, 昵称, 备注] = [分组, 昵称, 备注].map(文件名安全化)
        return [{
            路径: `小窗-${分组}-[${备注 || ''}@${昵称}](${Q号}@qq.com).url`,
            内容: URL文件生成(this.小窗URL获取(Q号))
        }, {
            路径: `空间-${分组}-[${备注 || ''}@${昵称}](${Q号}@qq.com).url`,
            内容: URL文件生成(this.空间URL获取(Q号))
        }]
    }).flat()
    return 文件列
}
const 加UTF8文件BOM头 = (str) => '\uFEFF' + str

if (!module.parent) (async () => {
    const 参 = require('yargs')
        .option('output', {
            alias: 'o',
            description: 'Output supports .csv, .tsv, .json, .zip, and folder ends with /',
            type: 'string'
        })
        .option('input', {
            alias: 'i',
            description: 'Input path supports .json and default as stdin(-)',
            type: 'string'
        })
        .option('utf8bom', {
            alias: 'u',
            description: 'Insert UTF8-Bom Header',
            type: 'boolean'
        })
        .help().alias('help', 'h').argv;

    const 输入路径 = 参.input
    const 输出路径 = 参.output
    const 输出BOM头 = 参.utf8bom ? 加UTF8文件BOM头('') : ''

    const { promisify } = require('util');
    const { writeFile, readFile, mkdir } = require('fs');
    const { dirname } = require('path');

    // =================================================== INPUT 
    let stdin;
    if (输入路径 == '-' || !输入路径) {
        stdin = await new Promise((resolve) => {
            var chunk = ''
            process.stdin.on("data", data => chunk += data)
            process.stdin.on('end', () => resolve(chunk))
        });
    } else {
        stdin = await promisify(readFile)(输入路径, { encoding: "utf-8" })
    }
    // =================================================== OUTPUT

    // node src/qzfriends.js -u -o dist/mine.csv < userdata/mine.json
    if (输出路径.endsWith('.csv')) {
        await promisify(writeFile)(输出路径,
            (输出BOM头 + this.向CSV转换(JSON.parse(stdin))))
    }
    // node src/qzfriends.js -o dist/mine.tsv < userdata/mine.json
    if (输出路径.endsWith('.tsv')) {
        await promisify(writeFile)(输出路径,
            (输出BOM头 + this.向TSV转换(JSON.parse(stdin))))
    }
    // node src/qzfriends.js -o dist/mine.json < userdata/mine.json
    if (输出路径.endsWith('.json')) {
        await promisify(writeFile)(输出路径,
            (输出BOM头 + this.向JSON转换(JSON.parse(stdin))))
    }
    // node src/qzfriends.js -o dist/mine.zip < userdata/mine.json
    if (输出路径.endsWith('.zip')) {
        const JSZip = require("jszip")
        const zip = new JSZip()
        const 文件列 = this.向URL文件列转换(JSON.parse(stdin))
        文件列.forEach(({ 路径, 内容 }) => zip.file(路径, 内容))
        await promisify(mkdir)(dirname(输出路径), { recursive: true });
        await zip.generateAsync({ type: "nodebuffer" }) // nodejs
            .then(async (内容) => await promisify(writeFile)(输出路径, 内容))
    }
    // node src/qzfriends.js -o dist/mine/ < userdata/mine.json
    if (输出路径.endsWith('/')) {
        const 文件列 = this.向URL文件列转换(JSON.parse(stdin))
        await Promise.all(文件列.map(async ({ 路径, 内容 }) => {
            const 真实路径 = 输出路径 + 路径
            await promisify(mkdir)(dirname(真实路径), { recursive: true })
            await promisify(writeFile)(真实路径, 内容)
        }))
    }
})()

