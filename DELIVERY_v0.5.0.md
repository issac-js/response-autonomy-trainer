# v0.5.0 交付说明（云同步 + iPhone 适配）

日期：2026-11-08（北京时间）。基线为线上 v0.4.2。本版新增可选云端同步与 iPhone 适配；主存储键 `response-autonomy-v01`、`version:1`、`schemaVersion:3`、题库与 FSRS 全部未变，**本地记录无需迁移**。

## 一、云服务开通与数据边界

| 项目 | 状态 |
| --- | --- |
| 应用 | `wbapp_35wMLSRqdNoN6GR7pEvjpB`（回应自主权训练） |
| 云服务 | 已开通，`billingStatus: normal`，`provisionStatus: assigned` |
| 数据表 | `rat_state`：每个登录用户一行，`owner_id` 主键、`payload` 为完整记录快照、`revision` 版本号 |
| 行级安全 | 已启用 RLS；SELECT / INSERT / UPDATE / DELETE 四条策略均限定 `owner_id = auth.uid()`，客户端从不发送 `owner_id` |
| 前端密钥 | 仅使用可公开的 `publishableKey`；服务端按精确 Origin 校验，没有长期密钥进入前端 |

未登录时表内查询返回 0 行（已实测），不会读取他人数据。云端记录可随时在面板中删除，删除只影响云端，本机保留。

## 二、同步行为

- **按需加载**：SDK 只在打开「设置与备份 → 云端同步」并登录时加载；离线打开与日常训练不会请求外网（实测首屏外部请求为 0）。
- **登录**：邮箱验证码，无需密码；验证码发送与校验绑定同一个 `verificationId`，验证码不会重复发送。
- **首次同步**：云端为空 → 上传本机；云端较新且本机未改 → 自动采用云端；两边都改过 → 提示选择，不静默覆盖。
- **保存后同步**：登录且开启「自动同步」时，本地保存 1.8 秒后推送到云端。
- **冲突判定**：以最后一次同步的 `revision` 为基准；`revision` 不匹配即视为冲突，界面给出「立即同步 / 用云端覆盖本机」两个明确动作。
- **破坏性操作**：用云端覆盖本机需二次确认，并把原记录写入 `response-autonomy-v01-before-remote` 作为回滚副本；删除云端记录需两次确认。

## 三、iPhone 适配

| 项目 | 实现 |
| --- | --- |
| 刘海与底部安全区 | `viewport-fit=cover` + `env(safe-area-inset-*)` 计算内边距 |
| 输入不缩放 | 表单控件统一 16px 字号 |
| 触控目标 | 按钮、标签页、选项、折叠标题最小 44px，`touch-action: manipulation` |
| 视口高度 | `100dvh`，避免地址栏收起时跳动 |
| 主屏安装 | `apple-mobile-web-app-capable`、`apple-mobile-web-app-title`、`apple-mobile-web-app-status-bar-style`、180px `apple-touch-icon`、`theme-color` |
| 点击反馈 | 自定义 `-webkit-tap-highlight-color`，不使用 hover 作为唯一提示 |
| 宽度 | 320 / 375 / 390 / 430px 设备模拟均无横向溢出 |

## 四、实际测试结果

| 套件 | 结果 |
| --- | --- |
| 核心 `core.cjs` | 42/42，216 条分支 |
| 存储回归 `regression.cjs` | 9/9 |
| 既有浏览器 `browser.cjs` | 14 项 + Windows WebKit 基础路径；v0.2 基线审计 1 项未执行 |
| 个人模块 `coach-browser.cjs` | 15/15 |
| 浏览器回归 `regression-browser.cjs` | 14/14 |
| 草稿隔离 `draft-regression.cjs` | 11/11 |
| HTTP 源 `http-origin.cjs` | 7/7 |
| iPhone 设备模拟（新增）`ios-mobile.cjs` | 9/9：iPhone 13 / SE / 14 Pro Max，WebKit |
| 跨引擎 `compat.cjs` | 4 引擎 × 10 项全部 pass |
| 迁移/回滚 `rollback.cjs` | 5/5 |
| 公网验收 | HTTP 200，HTML 与本地逐字节一致；标题与页脚 v0.5.0；iPhone 模拟无溢出、0 页面错误、首屏 0 外部请求 |

## 五、尚未验收

1. **真实 iPhone / iOS Safari 实机**：本机只有 Windows 版 WebKit，设备模拟不等于真机；面容/刘海安全区、软键盘遮挡、添加到主屏幕后的启动样式需你在手机上走一遍。
2. **真实邮箱验证码**：登录链路已按 SDK 文档实现并用未登录状态验证了会话与 RLS 边界，但没有向真实邮箱发码，因此「收码 → 登录 → 上传 → 另一设备恢复」的完整闭环需要你首次登录时确认。
3. **真实麦克风音质**：仍只做权限与录音回放的合成测试。
4. **Firefox/Gecko**：本机无二进制，未执行。
5. 同步为整份快照，不做逐条合并；两台设备同时离线编辑会产生冲突提示，需要手动选一份。

## 六、在 iPhone 上的建议步骤

1. Safari 打开分享链接，先在「设置与备份 → 云端同步」用邮箱验证码登录。
2. 回到首页正常使用；右上角「分享 → 添加到主屏幕」。
3. 在电脑上打开同一链接并登录同一邮箱，确认两端 `revision` 与「上次同步」时间一致。
4. 若提示冲突：先导出备份，再选择「用云端覆盖本机」或「立即同步」。

## 七、回滚

- **回到纯本地**：退出登录即可，应用不再发起云端请求；本机记录不变。
- **回到旧版本**：主存储结构未变，直接用 v0.4.2 的 `index.html` 打开即可读取现有记录；云端表不影响本地。
- **删除云端数据**：面板内「删除云端记录」，或在数据库管理面板删除 `rat_state` 中该用户的行。

本次未创建/推送/合并 GitHub 内容，未修改 LexiLoop。
