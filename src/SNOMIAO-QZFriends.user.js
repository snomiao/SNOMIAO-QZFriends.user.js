// ==UserScript==
// @name             [雪喵空友列] QQ 空间一键获取自己的好友列表
// @name:zh          [雪喵空友列] QQ 空间一键获取自己的好友列表、访客列表等
// @name:en          [SNOMIAO-QZFriends] Qzone clicks to get his friend list, visitor list, etc
// @namespace        https://userscript.snomiao.com/
// @version          1.3.2
// @description      [雪喵空友列] 一键导出下载 QQ 好友列表到 JSON、TSV、CSV Excel 进行管理，或作为 .url 链接放到桌面或使用 Everything、Listary 等以快速批量打开好友的聊天窗口。使用方法：登录 https://user.qzone.qq.com/ ，在顶栏获取好友列表。本项目仅为学习研究使用，本项目仅仅对你本人所浏览的 QQ 空间网页数据进行重新编码，没有任何越权功能。请保管好自己的个人数据，如有必要请亲自审查本项目代码，以确保自身隐私数据安全。项目地址： https://github.com/snomiao/SNOMIAO-QZFriends.user.js ，对本脚本有疑问请联系 QQ：snomiao@gmail.com。
// @description:zh   [雪喵空友列] 一键导出下载 QQ 好友列表到 JSON、TSV、CSV Excel 进行管理，或作为 .url 链接放到桌面或使用 Everything、Listary 等以快速批量打开好友的聊天窗口。使用方法：登录 https://user.qzone.qq.com/ ，在顶栏获取好友列表。本项目仅为学习研究使用，本项目仅仅对你本人所浏览的 QQ 空间网页数据进行重新编码，没有任何越权功能。请保管好自己的个人数据，如有必要请亲自审查本项目代码，以确保自身隐私数据安全。项目地址： https://github.com/snomiao/SNOMIAO-QZFriends.user.js ，对本脚本有疑问请联系 QQ：snomiao@gmail.com。
// @supportURL       https://github.com/snomiao/SNOMIAO-QZFriends.user.js
// @author           snomiao@gmail.com
// @match            *://user.qzone.qq.com/*
// @require          https://cdnjs.cloudflare.com/ajax/libs/jszip/3.5.0/jszip.min.js
// @grant            none
// @noframes
// ==/UserScript==
/* 相关阅读：
 * [数据主权 - 知乎]( https://www.zhihu.com/topic/20676535/hot )
 * [数据主权 - 知乎]( https://www.zhihu.com/topic/20676535/hot )
 *
 * 更新记录
 * v1.3.2 (20201011) 修复 zip 导出功能
 * v1.3.0 (20200831) 加入访客列表功能
 * v1.1 (20200714) 修复 uin 匹配问题
 * v1.0 (20200713) 完成 .URL 下载功能
 */

(() => {
  // 常规函数定义
  const 睡 = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const 下载URL到文件 = (url, filename = "") => {
    var a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };
  // 进度显示
  const 将进度在标题显示函数 =
    (函数) =>
    async (...参数) => {
      const 原标题 = document.title;
      const 返 = await 函数(...参数);
      document.title = 原标题;
      return 返;
    };
  const 进度显示 = (正在) => {
    var 串 = `[雪喵友列] ${正在}`;
    document.title = 串;
    console.log(串);
  };
  const 用户令牌获取 = () => {
    // 取cookie
    const getCookieByRegex = (regex) =>
      ((e) => (e && e[1]) || "")(document.cookie.match(regex));
    // 用户常量
    const uin = getCookieByRegex(/\buin=o0*(.*?)(?=;|$)/);
    const g_tk = (() => {
      var p_skey = getCookieByRegex(/\bp_skey=(.*?)(?=;|$)/);
      var skey = getCookieByRegex(/\bskey=(.*?)(?=;|$)/);
      var rv2 = getCookieByRegex(/\brv2=(.*?)(?=;|$)/);
      var b = p_skey || skey || rv2;
      var a = 5381;
      for (var c = 0, d = b.length; c < d; ++c)
        a += (a << 5) + b.charAt(c).charCodeAt();
      return a & 2147483647;
    })();
    const qzonetoken = window.g_qzonetoken;
    const uinView = parseInt(location.pathname.slice(1)); // 当前QQ空间的QQ号
    return { uin, g_tk, qzonetoken, uinView };
  };
  const { uin, g_tk, qzonetoken, uinView } = 用户令牌获取();
  // URL 文件打包下载
  const URL文件生成 = (url) => `[InternetShortcut]\nURL=${url}`;
  const 好友列表向URL文件转换并作为ZIP打包并下载 = async (好友列表) => {
    alert(
      `点击确定后，开始下载你的好友列表，一般来说在 Windows 系统的浏览器中下载的文件，解压后点击url文件出现会安全警告，请看解决方法：\n` +
        `方法1：请在解压前，对压缩包点一下右键属性，在属性下方，把安全警告勾掉，点确定，再解压即可。\n` +
        `方法2：对解压后的文件夹重新压缩再解压一遍。`
    );
    // 替换掉文件名里不允许出现的特殊字符
    const 文件名安全化 = (s) =>
      s.toString().replace(/[\<\>\:\?\$\%\^\&\*\\\/\'\"\;\|\~\t\r\n-]+/g, "-");

    const 打开QQ的URL获取 = (Q号) => `tencent://message?uin=${Q号}`;
    const 时间戳 =
      "(" +
      new Date()
        .toISOString()
        .slice(0, -4)
        .replace(/[^\dT]/g, "")
        .replace("T", ".") +
      ")";
    const 文件名 = 时间戳 + `-好友列表@${uin}.zip`;

    const zip = new JSZip();
    let n = 0;
    await Promise.all(
      好友列表.map(async ({ Q号, 分组, 昵称, 备注 }) => {
        [Q号, 分组, 昵称, 备注] = [Q号, 分组, 昵称, 备注].map(文件名安全化);
        zip.file(
          `${分组}/[${备注 || ""}@${昵称}](${Q号}@qq.com).url`,
          URL文件生成(打开QQ的URL获取(Q号))
        );
        const 完成率 = n++ / 好友列表.length;
        await 进度显示(`正在打包 ${Math.ceil(完成率 * 100)}%`);
      })
    );
    进度显示(`正在压缩...`);
    await zip.generateAsync({ type: "blob" }).then(function (content) {
      进度显示(`压缩完成，准备下载...`);
      进度显示(`正在下载...`);
      let url = window.URL.createObjectURL(content);
      下载URL到文件(url, 文件名);
      window.URL.revokeObjectURL(url);
    });
    return "";
  };
  const 复制文本 = (content) => {
    const input = document.createElement("textarea");
    input.setAttribute("readonly", "readonly");
    input.setAttribute("value", content);
    input.innerHTML = content;
    input.setAttribute("style", "position: fixed; top:0; left:0;z-index: 9999");
    document.body.appendChild(input);
    input.select();
    input.setSelectionRange(0, input.value.length);
    if (document.execCommand("copy")) {
      document.execCommand("copy");
      console.log(`长度为${content.length}的内容已复制`);
    }
    document.body.removeChild(input);
  };
  const 今日 = () =>
    new Date(+new Date() - new Date().getTimezoneOffset() * 60e3)
      .toISOString()
      .slice(0, 10);
  const 下载并复制文本 = (文本, 文件名) => {
    const 数据URL =
      "data:text/plain;base64," + btoa(unescape(encodeURIComponent(文本)));
    复制文本(文本.replace(/^\uFEFF/, "")); // 去掉BOM头
    if (confirm(文件名 + " 内容已复制，是否下载为文件？")) {
      下载URL到文件(数据URL, 文件名);
    }
  };
  // 下面这个函数启发自： [csv 文件打开乱码，有哪些方法可以解决？ - 知乎]( https://www.zhihu.com/question/21869078/answer/350728339 )
  const 加UTF8文件BOM头 = (串) => "\uFEFF" + 串;
  // 获取数据
  async function 好友列获取() {
    const { uinMe, g_tk, qzonetoken, uinView } = 用户令牌获取();
    const API地址 = `https://user.qzone.qq.com/proxy/domain/r.qzone.qq.com/cgi-bin/tfriend/friend_show_qqfriends.cgi?follow_flag=1&groupface_flag=0&fupdate=1&g_tk=${g_tk}&uin=${uin}`;
    const json = await jsonp抓取(API地址);
    const 分组名表 = Object.fromEntries(
      json.data.gpnames.map(({ gpid, gpname }) => [gpid, gpname])
    );
    const 好友列 = json.data.items.map(({ name, remark, uin, groupid }) => {
      const [Q号, 分组, 昵称, 备注] = [
        uin,
        ...[分组名表[groupid], name, remark].map(unescape),
      ];
      return { Q号, 分组, 昵称, 备注 };
    });
    return 好友列;
  }
  async function 动态访客列获取(tid = undefined) {
    if (!tid)
      return (
        await Promise.all(
          (
            await 动态列获取()
          )
            .map(({ tid }) => tid)
            .filter((e) => e)
            .map(动态访客列获取)
        )
      ).flat();

    const { uinMe, g_tk, qzonetoken, uinView } = 用户令牌获取();
    const num = 6,
      list = [];
    let totalNum = num;
    for (let beginNum = 1; beginNum <= totalNum; beginNum += num) {
      await 睡(200);
      const json = await jsonp抓取(
        `https://h5.qzone.qq.com/proxy/domain/g.qzone.qq.com/cgi-bin/friendshow/cgi_get_visitor_single?uin=${uinView}&appid=311&blogid=${tid}&param=${tid}&ref=qzfeeds&beginNum=${beginNum}&needFriend=1&num=${num}&g_tk=${g_tk}&qzonetoken=${qzonetoken}`
      );
      console.assert(json.data.list, "rt");
      totalNum = json.data.totalNum;
      if (!json.data.list.length) {
        console.warn("动态访客列获取：权限不够，需要黄钻才能获取更多数据");
        break;
      }
      list.push(...json.data.list);
    }
    const 动态访客列表 = list.map(
      ({
        uin,
        name,
        time,
        isFriend,
        source,
        mod,
        contentid,
        Isolate,
        is_medal,
        is_qzvip,
        qzvip_level,
        is_supervip,
        is_yearvip,
        medal_level,
        medal_days,
        medal_state,
        qzone_level,
        is_special_vip,
      }) => {
        // return { uin, name, time, isFriend, source, mod, contentid, Isolate, is_medal, is_qzvip, qzvip_level, is_supervip, is_yearvip, medal_level, medal_days, medal_state, qzone_level, is_special_vip }
        return { uin, name, time };
      }
    );
    console.log(动态访客列表);
    // 动态访客列 = 动态访客列获取(tid)
    // 动态访客列获取(tid)
    return 动态访客列表;
  }
  async function 动态列获取(uin = undefined) {
    const { uinMe, g_tk, qzonetoken, uinView } = 用户令牌获取();
    uin = uin || uinView || uinMe;

    const num = 20,
      msglist = [];
    let total = num;
    for (let pos = 0; pos < total; pos += 20) {
      const json = await jsonp抓取(
        `https://user.qzone.qq.com/proxy/domain/taotao.qq.com/cgi-bin/emotion_cgi_msglist_v6?uin=${uin}&ftype=0&sort=0&pos=${pos}&num=${num}&replynum=100&g_tk=${g_tk}&callback=_Callback&code_version=1&format=jsonp&need_private_comment=1&qzonetoken=${qzonetoken}`
      );
      console.log(json);
      total = json.total;
      if (json?.code !== 0) {
        return alert(`错误代码: ${json.code}`), [];
      }
      msglist.push(...json.msglist);
    }
    const 动态列表 = msglist?.map(
      ({
        certified,
        cmtnum,
        commentlist,
        conlist,
        content,
        createTime,
        created_time,
        editMask,
        fwdnum,
        has_more_con,
        isEditable,
        issigin,
        lbs,
        name,
        pic_template,
        right,
        rt_sum,
        secret,
        source_appid,
        source_name,
        source_url,
        t1_source,
        t1_subtype,
        t1_termtype,
        tid,
        ugc_right,
        uin,
        wbid,
      }) => {
        // 评论列表: commentlist
        // const 动态访客列 = 动态访客列获取(tid)
        // return {  }
        // return { 动态内容: content, 动态QQ号: uin, 动态ID: tid }
        return { uin, tid, createTime, content };
      }
    );
    console.log(msglist);
    console.log(动态列表);
    return 动态列表;
  }
  const 访客列获取 = async (保留完整原数据格式 = true) => {
    // const g_tk // 有了
    const API = `https://h5.qzone.qq.com/proxy/domain/g.qzone.qq.com/cgi-bin/friendshow/cgi_get_visitor_simple?uin=${uinView}&mask=3&g_tk=${g_tk}&fupdate=1&qzonetoken=${qzonetoken}`;
    const json = await jsonp抓取(API);
    json?.message &&
      json?.message !== "succ" &&
      alert("消息：" + json?.message);
    return 保留完整原数据格式
      ? json?.data?.items
      : json?.data?.items?.map(
          ({
            uin,
            name,
            online,
            cover_type,
            action_url,
            cover_ratio,
            brand_flag,
            brand_icon_jump_url,
            talent_level,
            talent_level_icon,
            new_visitor,
            yellow,
            lovervip,
            supervip,
            videofamous,
            isFriend,
            visit_hb_available,
            nameplate,
            is_special_vip,
            src,
            guest_desc,
            mod,
            time,
            flag,
            hide_from,
            ishideto,
            img,
            Isolate,
            is_medal,
            medal_level,
            medal_days,
            medal_state,
            qzone_level,
          }) => ({
            /* 弱水三千，我只取一瓢饮 */
            QQ号: uin,
            昵称: name,
            头像: img,
            时间: new Date(time * 1e3).toLocaleString(),
            是好友: (isFriend && "是好友") || "",
            黄钻等级: yellow,
            空间签名: guest_desc,
            空间等级: qzone_level,
          })
        );
  };
  function JSON列转CSV(列, 分割符 = ",") {
    const 键列 = [...new Set(列.map(Object.keys).flat())];
    const 分割转符义 = (串) =>
      typeof 串 === "string" && (串.match(分割符) || 串.match(/"|\r|\n/))
        ? `"${串.replace(/"/g, '""')}"`
        : 串;
    return [键列]
      .concat(列.map((对象) => 键列.map((键) => 对象[键]).map(分割转符义)))
      .map((e) => e.join(分割符))
      .join("\n");
  }
  //
  window.访客列表EXCELCSV导出 = 将进度在标题显示函数(async () =>
    下载并复制文本(
      加UTF8文件BOM头(JSON列转CSV(await 访客列获取(), ",")),
      今日() + `-访客列表@${uinView}.csv`
    )
  );
  window.访客列表TSV导出 = 将进度在标题显示函数(async () =>
    下载并复制文本(
      JSON列转CSV(await 访客列获取(), "\t"),
      今日() + `-访客列表@${uinView}.tsv`
    )
  );
  // window.访客列表原始数据EXCELCSV导出 = 将进度在标题显示函数(async () => 下载并复制文本(加UTF8文件BOM头(JSON列转CSV(await 访客列获取("保留原始数据"), ',')), 今日() + `-访客列表@${uinView}.csv`))
  // window.访客列表原始数据TSV导出 = 将进度在标题显示函数(async () => 下载并复制文本(JSON列转CSV(await 访客列获取("保留原始数据"), '\t'), 今日() + `-访客列表@${uinView}.tsv`))
  //
  window.好友列表JSON导出 = 将进度在标题显示函数(async () =>
    下载并复制文本(
      JSON.stringify(await 好友列获取()),
      今日() + `-好友列表@${uin}.json`
    )
  );
  window.好友列表TSV导出 = 将进度在标题显示函数(async () =>
    下载并复制文本(
      JSON列转CSV(await 好友列获取(), "\t"),
      今日() + `-好友列表@${uin}.tsv`
    )
  );
  window.好友列表CSV导出 = 将进度在标题显示函数(async () =>
    下载并复制文本(
      JSON列转CSV(await 好友列获取()),
      今日() + `-好友列表@${uin}.csv`
    )
  );
  window.好友列表ZIP导出 = 将进度在标题显示函数(async () =>
    好友列表向URL文件转换并作为ZIP打包并下载(await 好友列获取())
  );
  window.好友列表EXCELCSV导出 = 将进度在标题显示函数(async () =>
    下载并复制文本(
      加UTF8文件BOM头(JSON列转CSV(await 好友列获取())),
      今日() + `-好友列表@${uin}.csv`
    )
  );
  //
  window.动态列表JSON导出 = 将进度在标题显示函数(async () =>
    下载并复制文本(
      JSON.stringify(await 动态列获取()),
      今日() + `-动态列表@${uinView}.tsv`
    )
  );
  window.动态列表TSV导出 = 将进度在标题显示函数(async () =>
    下载并复制文本(
      JSON列转CSV(await 动态列获取(), "\t"),
      今日() + `-动态列表@${uinView}.tsv`
    )
  );
  window.动态列表EXCELCSV导出 = 将进度在标题显示函数(async () =>
    下载并复制文本(
      加UTF8文件BOM头(JSON列转CSV(await 动态列获取(), ",")),
      今日() + `-动态列表@${uinView}.csv`
    )
  );
  //
  window.动态访客列表JSON导出 = 将进度在标题显示函数(async () =>
    下载并复制文本(
      await 动态访客列获取(),
      今日() + `-动态访客列表@${uinView}.tsv`
    )
  );
  window.动态访客列表TSV导出 = 将进度在标题显示函数(async () =>
    下载并复制文本(
      JSON列转CSV(await 动态访客列获取(), "\t"),
      今日() + `-动态访客列表@${uinView}.tsv`
    )
  );
  window.动态访客列表EXCELCSV导出 = 将进度在标题显示函数(async () =>
    下载并复制文本(
      加UTF8文件BOM头(JSON列转CSV(await 动态访客列获取(), ",")),
      今日() + `-动态访客列表@${uinView}.csv`
    )
  );
  // UI 用函数定义
  const 新元素 = (innerHTML, attributes = {}) => {
    const e = document.createElement("div");
    e.innerHTML = innerHTML;
    return Object.assign(e.children[0], attributes);
  };
  //
  function 按钮向页面插入() {
    // 在“个人中心”按钮前插入一个按钮
    // const 好友菜单按钮 = document.querySelector('#tb_friend_li')
    const 顶栏导航首项 = document.querySelector(".top-nav>*");
    在之前插入(
      顶栏导航首项,
      新元素(`
            <li class="nav-list" id="tb_export_li">
                <div class="nav-list-inner">
                    <a id="export" href="javascript:" class="homepage-link a-link nav-hover" accesskey="z"><i class="ui-icon icon-friend"></i><span>导出好友、访客列表</span><i class="drop-down-arrow"></i></a>
                </div>
                <div class="nav-drop-down export-drop-down" id="export-drop-down" style="display: none; height: 30em">
                    <div class="side-area">
                        <!-- <div class="friends-link"> -->
                            <!-- <a href="javascript:" class="link-icon"><i class="icon-friends"></i></a> -->
                            <!-- <a href="javascript:" class="link-text">寻找好友</a> -->
                        <!-- </div> -->
                        <!-- <div class="friends-relation"> -->
                            <!-- <a href="javascript:" class="link-icon"><i class="icon-relation"></i></a> -->
                            <!-- <a href="javascript:" class="link-text">亲密度</a> -->
                        <!-- </div> -->
                    </div>
                    <div class="main-area">
                        <br>
                        <h3>最近访客列表导出：</h3>
                        <ul style="display: flex">
                        <li style="margin: 1em"><a onclick="访客列表EXCELCSV导出()" href="javascript:" style="padding: 1rem" title="复制并下载CSV格式的最近30个访客列表">.CSV</a></li>
                        <li style="margin: 1em"><a onclick="访客列表TSV导出()" href="javascript:" style="padding: 1rem" title="复制并下载TSV格式的最近30个访客列表">.TSV</a></li>
                        </ul>
                        <h3>☑👫📜好友列表导出</h3>
                        <ul style="display: flex">
                        <li style="margin: 1em"><a onclick="好友列表JSON导出()" href="javascript:" style="padding: 1rem" title="复制并下载JSON格式">.JSON</a></li>
                        <li style="margin: 1em"><a onclick="好友列表TSV导出()" href="javascript:" style="padding: 1rem" title="复制并下载TSV格式">.TSV</a></li>
                        <li style="margin: 1em"><a onclick="好友列表EXCELCSV导出()" href="javascript:" style="padding: 1rem" title="复制并下载 Excel 可直接打开的CSV格式" >.CSV(Excel)</a></li>
                        <li style="margin: 1em"><a onclick="好友列表ZIP导出()" href="javascript:" style="padding: 1rem" title="下载按目录划分的 .url 文件为 .zip包" >.URL.ZIP</a></li>
                        </ul>
                        <h3>说说动态列表导出</h3>
                        <ul style="display: flex">
                        <li style="margin: 1em"><a onclick="动态列表JSON导出()" href="javascript:" style="padding: 1rem" title="复制并下载JSON格式">.JSON</a></li>
                        <li style="margin: 1em"><a onclick="动态列表TSV导出()" href="javascript:" style="padding: 1rem" title="复制并下载TSV格式">.TSV</a></li>
                        <li style="margin: 1em"><a onclick="动态列表EXCELCSV导出()" href="javascript:" style="padding: 1rem" title="复制并下载 Excel 可直接打开的CSV格式" >.CSV(Excel)</a></li>
                        </ul>
                        <h3>说说动态访客列表导出（如果数据量大要很久）</h3>
                        <ul style="display: flex">
                        <li style="margin: 1em"><a onclick="动态访客列表JSON导出()" href="javascript:" style="padding: 1rem" title="复制并下载JSON格式">.JSON</a></li>
                        <li style="margin: 1em"><a onclick="动态访客列表TSV导出()" href="javascript:" style="padding: 1rem" title="复制并下载TSV格式">.TSV</a></li>
                        <li style="margin: 1em"><a onclick="动态访客列表EXCELCSV导出()" href="javascript:" style="padding: 1rem" title="复制并下载 Excel 可直接打开的CSV格式" >.CSV(Excel)</a></li>
                        </ul>
                    </div>
                </div>
            </li>`)
    );

    let displayPanel = false;
    document
      .querySelector("#export")
      .addEventListener("mouseenter", function (e) {
        displayPanel = !displayPanel;
        document.querySelector("#export-drop-down").style.display = displayPanel
          ? "inherit"
          : "none";
      });
    document
      .querySelector("#export-drop-down")
      .addEventListener("mouseleave", function (e) {
        displayPanel = !displayPanel;
        document.querySelector("#export-drop-down").style.display = displayPanel
          ? "inherit"
          : "none";
      });
  }
  // const 动态访客列表功能插入 = () => {
  //     <a class="state qz_feed_plugin" data-role="Visitor" data-config="311|171d763bd1e5495f26090700|997596439" data-clicklog="visitor">浏览373次</a>
  //     点击导出列表
  // }

  // 生成界面
  if (location.hostname == "user.qzone.qq.com") {
    按钮向页面插入();
  }
  async function jsonp抓取(API地址) {
    return await fetch(API地址, { credentials: "include" })
      .then((res) => res.text())
      .then(async (jsonp) => {
        const _Callback = (json) => json;
        return eval(await jsonp);
      });
  }

  function 在之前插入(好友菜单按钮, 控件) {
    好友菜单按钮 && 好友菜单按钮.parentNode.insertBefore(控件, 好友菜单按钮);
  }
})();
