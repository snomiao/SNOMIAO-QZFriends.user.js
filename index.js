var _callback = (e) => {
    var 元 = e.data;
    var 群名 = Object.entires(元.gpnames.map(({ gpid, gpname }) => [gpid, gpname]))
    var 输出 = 元.items.map(
        ({ name, remark, uin, groupid }) => [uin, 群名[groupid], name, remark].replace('\t').join('\t'))
    console.log(输出)
}