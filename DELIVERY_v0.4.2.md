# v0.4.2 交付说明（草稿保护增量修复）

日期：2026-11-08（北京时间）。基线为已交付并在线上运行的 v0.4.1。本版只修复独立复核 `Response_Autonomy_Trainer_v0.4.1_Audit_Handoff.zip` 指出的 F1/F2/F3，并更正交付文档口径（F4）；未重写题库、FSRS、主存储结构或训练原则。

## 一、修复项与前后证据

| 编号 | 缺陷 | 修复前（独立复核实测） | 修复后（本版实测） |
| --- | --- | --- | --- |
| F1 | 未提交原话离开后，再开同一张卡 / 同一多轮情境被清空 | 同卡重开 `reopenedValue=""`；同情境重开 `reopenedValue=""`；缓存被整组清除 | 同卡重开恢复 `SYNTHETIC-SAME-CARD-未提交原话`；同情境重开恢复 `SYNTHETIC-SAME-DIALOGUE-未提交原话`；另一张卡仍为空 |
| F2 | 记录 id 为 `a` 与 `a:b` 时，保存 `a` 会误删 `a:b` 的未提交观察 | `otherRecordValue=""` | `otherRecordValue="SYNTHETIC-OTHER-观察"`；反向先保存 `a:b` 时 `a` 的草稿同样保留 |
| F3 | 空白浏览器首次导入提示“快照已保留”，实际没有快照 | `status="备份已恢复，导入前快照已保留。"`，`snapshot=null` | `status="备份已恢复。此前没有本地记录，因此没有生成导入前快照。"`，`snapshot=null` |
| F4 | 交付说明保留 45/45、6 份 md 等阶段数字，且先后表述与部署状态冲突 | 与实际包（48 文件 / 47 条校验 / 包内 5 份 md）不一致 | 本文给出最终数字；`DELIVERY_v0.4.1.md` 标注为历史阶段并更正为 47/47、包内 5 份 |

## 二、根因与改动

**F1 根因**：`start()` 与 `startDialogue()` 无条件清空唯一的草稿键；键也没有绑定卡片、情境与轮次，为了避免串题只能整组清除，于是同题恢复也失效。

- `form-guard.js`：草稿条目改为 `{g:分组, o:归属, n:节点, f:字段, v:值}`，按四项精确匹配。
- `single.js`：单轮原话与复盘按卡片编号归属；仅在自评保存成功后清除该卡。
- `app.js`：多轮原话按「情境 + 轮次」归属；另以 `response-autonomy-v01-dialogue-v1` 保存未完成的会话进度（节点、轮次、已选行动、原话、已答步骤），重开同一情境回到原轮次；卡片库给有草稿的卡加标记，多轮列表显示可继续提示。
- 清除时机：回答保存成功、完成后、或用户点“退出本轮 / 返回情境库”明确放弃。

**F2 根因**：`unsavedClear('coachObserve:'+id+':')` 用字符串前缀判断，`coachObserve:a:` 会同时匹配 `coachObserve:a:b:actual`。

- 改为按 `group + owner` 精确相等删除，`owner` 就是记录 id 原文；`a` 与 `a:b` 互不影响，也不限制历史 id 形态。
- `safe()` 仍负责 HTML 属性转义；缓存键隔离与 HTML 安全分开处理。

**F3 根因**：`restoreBackup` 把 `snapshot` 初始化为 `true`，`before === null` 时跳过写快照却仍返回成功。

- 改为三态返回值：`saved` / `none` / `failed`，`settings.js` 分别给出“已保留 / 无需生成 / 未能保存，请立即导出”。
- 保留 v0.4.1 已修好的“主记录先写、快照尽力而为”顺序与失败保护。

**F4**：见第一节表格与 `DELIVERY_v0.4.1.md` 的阶段说明。

**兼容性**：主存储键、`version:1`、`schemaVersion:3`、字段结构、FSRS、题库、14 单元 / 6 场景全部未变，**无需迁移**。临时草稿键由 `-unsaved-v1` 升为 `-unsaved-v2`，仅存在于 `sessionStorage`；旧键在启动时清除，关闭标签页即消失。

## 三、实际测试结果

本机 Windows 11，Node v24.14.0，Playwright 1.62.1（自带 Chromium、系统 Edge、系统 Chrome、Windows WebKit）。

| 套件 | 命令 | 结果 |
| --- | --- | --- |
| 核心 | `node tests/core.cjs` | 42/42，216 条固定分支路径 |
| 存储回归 | `node tests/regression.cjs` | 9/9（新增“首次导入返回 none”1 项） |
| 既有浏览器 | `node tests/browser.cjs` | 14 项执行通过；Windows WebKit 基础路径 passed；v0.2 基线审计 1 项未执行 |
| 个人模块 | `node tests/coach-browser.cjs` | 15/15 |
| 浏览器回归 | `node tests/regression-browser.cjs` | 14/14 |
| 草稿隔离回归（新增） | `node tests/draft-regression.cjs` | 11/11 |
| 独立验收包 | `draft-acceptance.cjs`（复核方提供） | 4/4，0 失败 0 错误 |
| HTTP 源 | `node tests/http-origin.cjs` | 7/7 |
| 跨引擎 | `node tests/compat.cjs` | 4 引擎 × 10 项全部 pass |
| 迁移/回滚 | `node tests/rollback.cjs` | 5/5 |
| 解包复验 | `sha256sum -c SHA256SUMS.txt` + `python rebuild.py` | 校验清单全通过；重建逐字节一致 |

新增 `tests/draft-regression.cjs` 覆盖：同卡恢复且不串卡、保存后仅清该卡、同情境恢复、跨轮次恢复并保留已答步骤、完成后清除、`a` / `a:b` 双向隔离、首次导入三态提示、已有记录仍保留精确快照、手动清除不影响主记录。结果文件 `tests/draft-regression-results.json`，独立验收包复跑结果保存在 `.audit-handoff`（不在交付包内）。

## 四、尚未通过 / 未验收

1. **v0.2 基线浏览器审计**仍未执行（本机缺该基线文件），因此“既有功能 15 项”本机只复现 14 项，第 15 项不计通过。
2. **iOS / macOS Safari 实机、Firefox/Gecko、真实麦克风音质、人工视觉审校**未验收；Windows WebKit 通过不等于 Safari 实机通过。
3. **线上已更新为 v0.4.2**（用户明确确认后重新发布同一分享链接）：HTTP 200，原始 HTML 223,629 字节，SHA-256 `716897f4…`，与本地 `index.html` 逐字节一致；在公网链接上复跑独立验收包四项专项，4/4 通过、0 失败 0 错误。此前线上 v0.4.1 的 F1/F2/F3 已不再存在。
4. **未创建远程仓库、未推送**：本地仓库已提交，远程步骤仍需用户完成。
5. 练习队列本身（当天剩余卡片、当前阶段）刷新后仍重置；本版保证的是**已写原话可按卡/情境取回**，不是恢复整个队列。

## 五、迁移与回滚

- **升级**：无需迁移。打开 `index.html` 即用；已有 `response-autonomy-v01` 记录原样读取，旧临时草稿键自动清理。
- **回滚到 v0.4.1 / v0.4.0**：主结构未变，直接用对应版本的 `index.html` 打开即可；跨设备仍以 JSON 备份迁移。已实测当前构建导出的 `cards`（含 FSRS）、`history`、`writes`、`dialogueHistory`、`coach.runs`、`coach.experiments` 可无损导入原始 v0.4.0，并可再导回。
- **回滚草稿行为**：若需回到旧行为，只能换回旧 `index.html`；主记录不受影响。
- **异常恢复**：本地数据损坏时显示恢复页且原字节不动，先导出原文再导入有效备份；保存配额失败或标签页冲突时主记录不变，可导出未保存记录。

## 六、交付清单

- `index.html`：v0.4.2 单文件离线应用（版本号见页脚与 `APP_VERSION`）。
- `Response_Autonomy_Trainer_v0.4.2.zip`：66 个文件（含 `SHA256SUMS.txt`），不含 `.git` 与个人版说明；`SHA256SUMS.txt` 共 65 条，解包与全新克隆均为 65/65 匹配。
- 本文件与 `DELIVERY_v0.4.1.md`（历史阶段）。
- `README.md`、`TRAINING_DESIGN.md`、`PERSONAL_TRAINING_SPEC_v0.4.md`（个人版仅本地，不入包）。
- 所有 `.md` 通过 `lint_md.py` 与 `markdownlint-cli2` 双校验。

本次仅按用户明确确认，把既有分享链接的内容从 v0.4.1 覆盖为 v0.4.2；未创建/推送/合并 GitHub 内容、未修改 LexiLoop、未接入上传原话或录音的外部服务。
