# v0.4.1 交付说明

日期：2026-11-08（北京时间）。基线为附件 `Response_Autonomy_Trainer_v0.4.zip` 内的 v0.4.0。本版是**缺陷修复版**，不是功能重写，也不是为升版本号而改结构。

> **阶段说明**：本文记录 v0.4.1 交付时的状态。独立复核随后发现草稿保护仍有 F1/F2/F3 三项缺陷与本文数字口径问题（F4），已在 **v0.4.2** 修复；本版不再作为当前交付物，保留作历史对照。当前状态见 `DELIVERY_v0.4.2.md`。

## 一、版本与文件确认

- 附件解出 26 个文件，`SHA256SUMS.txt` 全部核对通过；工作区、桌面、文档、下载目录与 D 盘均未发现同名项目的更新版本，因此不存在需要保留的增量内容，未用附件覆盖任何既有工作。
- 原始 v0.4.0 另解到交付目录之外的 `../baseline-v0.4.0/`，校验和同样全部通过，用于逐项 A/B 对照与回滚验证。
- 已先复现基线测试：`node tests/core.cjs` 输出 `{"passed":42,"dialoguePaths":216}`，与随附 `tests/core-results.txt` 逐行一致；`coach-browser.cjs` 15/15；`browser.cjs` 在本机执行 14 项通过、1 项未执行。

## 二、实测发现的缺陷（均有前后对照证据）

| 编号 | 缺陷 | 修复前的实测证据 | 根因 |
| --- | --- | --- | --- |
| D1 | 导入备份中的记录 `id` 可注入 HTML 并执行脚本 | 构造 `a"><img src=x onerror=window.bad=1><span b="` 作为实验记录 id，经 UI 导入后 `window.bad === 1`，`#root` 内出现 10 个 `<img>`，并注入 4 个 `onfocus` 属性 | `coachScoreInput` / `coachCheckInputs` 把未转义 id 直接拼进 `id=` 与 `for=` 属性 |
| D2 | 未提交表单在导航或刷新后静默丢失 | 真实计划三个字段在导航返回后为 `""`；模拟草稿 `#coachOwn` 刷新后为 `""`；单轮 `#reply` 刷新后随页面一起丢失 | 只有内存变量，无临时草稿、无离开前提示 |
| D3 | 失败的导入会覆盖此前的回滚快照 | A/B：先成功导入产生快照 A，再触发主存储写入失败；v0.4.0 的快照变为较新的当前记录（A 丢失），v0.4.1 保留 A | `restoreBackup` 先写 `-before-import` 再写主记录 |
| D4 | 仅快照写入失败会中止本来有效的导入 | A/B：模拟 `-before-import` 配额失败；v0.4.0 显示「导入失败」且 `newPerDay` 仍为 3，v0.4.1 显示「已恢复」且为 5，并提示立即导出 | 同上 |
| D5 | WebKit 检查在基线被记为启动失败 | 基线 `browser-results.json` 记录 `Executable doesn't exist ... webkit-2215`；本机 `PLAYWRIGHT_BROWSERS_PATH` 下 Chromium 在 `ms-playwright/` 子目录、WebKit 在顶层，路径不一致 | 测试环境浏览器缓存布局，非应用代码 |

## 三、修复内容

| 文件 | 改动 |
| --- | --- |
| `coach.js` | 所有动态 `id` / `for` / `data-unsaved` 属性经 `safe()` 转义；DOM 读取仍用原始 id（HTML 实体解码后一致）；所有表单加 `data-unsaved` 分组键；各成功保存动作清除对应临时草稿；`coachPlan` / `coachObserve` 按声明上限截断；`coachId()` 在 `randomUUID` 抛错时回退 |
| `form-guard.js`（新增） | 本标签页临时草稿：独立 `sessionStorage` 键 `response-autonomy-v01-unsaved-v1`，按表单分组；`beforeunload` 离开前提示；`MutationObserver` 在重新渲染后恢复；顶部提示条与一键清除；`sessionStorage` 不可用时仍保留提示能力 |
| `template.html` | 新增提示条容器、`[hidden]{display:none!important}`、标题与页脚版本号 |
| `data.js` | `restoreBackup` 改为先写主记录、快照尽力而为并返回状态；`APP_VERSION` 由 `0.4.0` 改为 `0.4.1`（仅元数据） |
| `settings.js` | 导入/重置后清除临时草稿；快照未写成时改为明确提示「请立即导出当前备份」；补充临时草稿边界说明 |
| `app.js` / `single.js` | 单轮与多轮表单接入临时草稿；各会话边界清除，防止文字串到另一张卡 |
| `rebuild.py` | 把 `form-guard.js` 纳入单文件装配 |
| `tests/` | 新增 `regression.cjs`、`regression-browser.cjs`、`compat.cjs`、`rollback.cjs`；`browser.cjs` 显式记录被跳过的基线项 |

**未改动**：`cards.json`、`dialogues.json`（与 v0.3 逐字节一致）、`coach-data.js` 的题目/场景/单元内容、`vendor/` 与 FSRS 调度、验证规则中的字段结构、14 个单元与 6 类场景、A/B/D 触发点定义、模拟与真实证据分离逻辑。

## 四、明确保持的设计约束

- 存储键 `response-autonomy-v01`、`version:1`、`schemaVersion:3`、全部字段名与取值规则**未变**，无需迁移；`defaultData()` 字段集合经回归检查逐项比对。
- 先独立作答再看选项；允许多种合理表达与「其他」；不按字数、拒绝次数或焦虑下降判定成功；模拟成绩与真实交流证据分开。
- 临时草稿只写 `sessionStorage`，不进入学习记录、不进入 JSON 备份、不上传、不接外部服务；关闭标签页即清除。
- 单文件离线版本仍可用，与 LexiLoop 独立；本阶段未创建/推送/合并 GitHub 内容，也未部署。后续的 L1 静态发布见第九节，属于同一日的下一阶段。
- **没有**智能语义评分、自动转写、语速检测、AI 多轮推理；不宣称具备，也不宣称临床或现实迁移疗效。

## 五、实际测试结果

本机环境：Windows 11，Node v24.14.0，Python 3.13.14，Playwright 1.62.1（系统已装 Chromium/Edge/Chrome/WebKit 二进制）。浏览器缓存布局不一致，用交付目录之外的目录联接统一，未修改用户缓存。

| 套件 | 命令 | 实际结果 | 结果文件 |
| --- | --- | --- | --- |
| 核心检查（基线） | `node tests/core.cjs` | 42/42，216 条固定分支路径 | `tests/core-results.txt` |
| 既有浏览器（基线） | `node tests/browser.cjs` | 14 项执行通过；Windows WebKit 基础路径 passed；**1 项未执行** | `tests/browser-results.json` |
| 个人模块浏览器（基线） | `node tests/coach-browser.cjs` | 15/15 | `tests/coach-browser-results.json` |
| 存储回归（新增） | `node tests/regression.cjs` | 8/8 | `tests/regression-results.txt` |
| 浏览器回归（新增） | `node tests/regression-browser.cjs` | 14/14，含完整使用流程与失败路径 | `tests/regression-browser-results.json` |
| 跨引擎兼容性（新增） | `node tests/compat.cjs` | 4 引擎 × 10 项全部 pass，`notPassed:[]` | `tests/compat-results.json` |
| 迁移/回滚（新增） | `node tests/rollback.cjs` | 5/5 | `tests/rollback-results.json` |
| HTTP 源（新增） | `node tests/http-origin.cjs` | 7/7 | `tests/http-origin-results.json` |

四个引擎：Playwright 自带 Chromium、系统 Edge、系统 Chrome、Playwright Windows WebKit。每项为加载、单轮主动回忆与 FSRS、三轮模拟、真实计划、刷新保留、未保存表单保护、v0.3 备份导入、320px 无横向溢出、无外部请求、无页面脚本错误。

新增回归覆盖的关键场景：真实计划/观察/模拟原话在导航、切换视图、刷新后可恢复；临时草稿不进入主记录或导出 JSON；清除按钮；构造恶意 id 不再执行脚本且该记录仍可正常保存观察；失败导入不产生误导快照；v0.3 UI 往返；完整「卡片 → 三轮模拟 → 真实计划/观察 → 复盘 → 导出导入 → 刷新」流程；`sessionStorage` 不可用时 `beforeunload` 仍提示；320/390/1440 宽度含提示条无溢出；零页面脚本错误、零外部 HTTP 请求。

`tests/preview-*.png` 与 `tests/coach-*.png` 是本次实际生成的合成数据界面截图，随交付保留作为视觉证据。

对**解包后的交付物**另做独立验证：`sha256sum -c SHA256SUMS.txt` 47/47 OK；在解包目录运行 `python rebuild.py` 得到的 `index.html` 与交付 HTML 哈希一致；解包后的单文件 `index.html` 以 `file://` 打开可运行（版本号 0.4.1、未保存文本可恢复、0 页面错误、0 外部请求）。

## 六、尚未通过的验收项与环境阻塞

1. **v0.2 基线浏览器审计未执行**：`RAT_BASELINE_PATH` 默认指向的 `D:\迅雷下载\project\Response_Autonomy_Trainer_v0.2\index.html` 在本机不存在。因此基线报告中的「既有功能 15 项」在本机只复现 14 项，第 15 项记录为 `skipped`，**不计通过**。可用 `RAT_BASELINE_PATH` 指定该基线后重跑。
2. **基线报告称 30 项 Chromium 检查通过（15+15）**；本机实得 29 项，差额即上述未执行的基线审计。
3. **iOS Safari / macOS Safari / 真机实机**：未验收。Windows 版 WebKit 通过不等于 Safari 实机通过；`beforeunload` 在 iOS Safari 上不可靠，临时草稿恢复是主要兜底，但未在 iOS 实测。
4. **Firefox / Gecko**：本机无对应浏览器二进制，未执行，不标记通过。
5. **真实麦克风音质与权限交互**：只用了 Playwright 的假设备与权限拒绝模拟，未验收真实硬件。
6. **人工视觉与无障碍审校**：只有程序化溢出检查与截图，未做人工逐页审校。
7. **仍不存在的产品能力**：智能语义评分、自动转写、语速检测、AI 多轮推理、真实疗效数据；按需求明确不实现，不作为「通过」项。
8. **临时进度边界**：练习卡片与多轮模拟的题号、队列、阶段在刷新后不恢复；文字草稿不会串到另一张卡，但会话状态本身会重置。
9. **快照语义**：`response-autonomy-v01-before-import` 每次成功导入会被覆盖，仅保留最近一次；跨版本回滚请另存手动备份。

## 七、迁移与回滚方法

### 升级（无需迁移）

1. 在 v0.4.0「设置与备份」导出 JSON，另存一份到安全位置并先脱敏。
2. 关闭 v0.4.0 页面，避免旧标签写回。
3. 打开本版 `index.html`，在「设置与备份」导入该 JSON；导入前完整校验、写入主记录、再写导入前快照。
4. 核对 53 张卡编号、FSRS 到期日、历史、模拟草稿、真实观察与题目编号。v0.1/v0.2/v0.3 数据会在内存升为 schemaVersion 3，下一次明确保存时落盘，到期日不重算。

### 回滚到 v0.4.0

1. 在本版导出当前 JSON（或用升级前的备份）。
2. 关闭本版页面；打开原始 v0.4.0 的 `index.html`。
3. 导入该 JSON。已实测：`cards`（含 FSRS）、`history`、`writes`、`dialogueHistory`、`coach.runs`、`coach.experiments` 全部逐字节一致；再从 v0.4.0 导回 v0.4.1 同样一致。
4. 若不同 `file://` 路径的浏览器存储相互隔离，请以 JSON 为准，不要依赖自动继承。临时草稿不随 JSON 迁移，切换前请先点相应保存按钮。
5. `v0.3` 及更早应用会拒绝 schemaVersion 3 数据；要回 v0.3 请使用升级到 v0.4 之前的备份。

**异常恢复**：本地数据损坏时应用显示恢复页且原字节不动，先用「导出当前存储原文」保存原文，再导入有效备份；保存配额失败或标签页冲突时，主记录不变，可在设置中「导出未保存记录」。

## 八、交付物

- `index.html`：重建后的单文件离线应用，可直接双击运行。
- `Response_Autonomy_Trainer_v0.4.1.zip`：完整可编辑源码、题库、依赖许可、测试与结果、文档、`SHA256SUMS.txt`。
- 本文件：变更说明、实测结果、未通过项、迁移/回滚方法。
- `README.md`：使用与边界说明；`AUDIT_AND_QA_v0.4.md` 保持基线原文，未改写历史结论或数字，仅为 markdownlint 合规补了 2 处列表前空行。
- `TRAINING_DESIGN.md`：面向版本库的通用设计说明；本地个人化版本 `PERSONAL_TRAINING_SPEC_v0.4.md` 已由 `.gitignore` 排除，不进入仓库。
- `.markdownlint-cli2.jsonc`：中文文档校验配置（关闭 MD013 / MD034 / MD060）。工作区 6 份 `.md`（含未入库的个人说明）全部通过 `lint_md.py` 与 `markdownlint-cli2` 双校验；交付包内 5 份，均 0 issue。

## 九、在线版本与仓库

- 静态发布（L1）：`https://response-autonomy-trainer.app.workbuddy.host/?sharecode=O6CO6UZJWZ`。发布后在真实公网链接复测：HTTP 200、`isSecureContext=true`、`APP_VERSION=0.4.1`、`localStorage`/`sessionStorage` 可用、FSRS 刷新后保留、未保存文本可恢复、320px 无横向溢出、0 页面错误、0 外部请求。在线版数据仍只存在访问者各自浏览器，未接入云端存储。
- 本地 Git 仓库：`Response_Autonomy_Trainer_v0.4/` 内已初始化 `main` 分支并完成初始提交；`PERSONAL_TRAINING_SPEC_v0.4.md` 由 `.gitignore` 排除，仓库内为通用版 `TRAINING_DESIGN.md`。CI 在全新克隆上等效验证通过：47/47 校验和、`core.cjs` 42/42、`rebuild.py` 重建与提交一致。
- 尚未创建远程仓库、未推送；具体命令见交付回复。

## 十、应用图标重设计

原桌面快捷方式继承的是 Edge 为无 favicon 页面生成的占位图标（深灰底、白色线框字母 A），既无产品语义也无品牌色。本次重做：

| 项目 | 内容 |
| --- | --- |
| 语义 | 「对话中的一拍」：白色对话气泡内的两条暂停竖条 |
| 配色 | 底 `#1C1136 → #56379B`（冷光＋暖角），气泡纯白，竖条 `#3A2370 → #1F1238` |
| 尺寸策略 | 16/20/24/32 用简化暂停标；40 及以上用完整气泡版 |
| 产物 | `assets/icon.svg`、`assets/icon-compact.svg`、`assets/icon.ico`（10 帧 16–256）、`assets/icon-*.png` |
| 内联 | `rebuild.py` 将 32/64 图标以 data URI 写入单文件并加 `theme-color`，离线仍显示正确 favicon |
| 应用范围 | 已替换 Edge 的 PWA 图标缓存并刷新系统图标缓存；**在线站点尚未重新发布**，需另行确认 |

原始图标已备份在交付目录之外：`../.icon-backup/`。如需回退，把该目录中的 `.ico` 与 `.ico.md5` 复制回 Edge 的 `Web Applications\_crx__olieoimhinnbladoagojjgfleebnkkad\` 并刷新图标缓存。

重建设计：修改 `assets/*.svg` 后运行 `node tools/render-icon.cjs`（需 Playwright），再 `python rebuild.py`。
