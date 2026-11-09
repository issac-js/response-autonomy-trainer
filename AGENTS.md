# AGENTS.md｜给自动化编码代理的约定

本项目是**单文件离线 Web 应用**。`index.html` 是 `rebuild.py` 的**构建产物**，不是手写页面。

## 最容易踩的坑

**不要直接编辑 `index.html`。** CI（`.github/workflows/ci.yml`）会执行 `python rebuild.py`，再断言 `git diff --exit-code -- index.html` 为空。直接改产物会让重建后出现 diff，CI 必红；更糟的是，你的修改会在下一次构建时被静默覆盖。

正确做法：改源码 → 运行 `python rebuild.py` → 产物随之更新。

## 构建

```bash
python rebuild.py      # 仅需 Python 标准库，无 npm 依赖
```

装配顺序（`rebuild.py` 内固定，不可调换）：

```text
coach-data.js → data.js → form-guard.js → voice.js → mechanisms.js
→ single.js → settings.js → cloud.js → coach.js → app.js
```

产物会把 `assets/icon-32.png`、`icon-64.png`、`icon-180.png` 以 data URI 内联并写入 `theme-color`；`template.html` 中的 `<!--ICON_LINKS-->` 与 `<!--APPLE_ICON-->` 占位符必须各被替换恰好一次，否则构建抛错。

## 提交前自检（与 CI 完全一致）

```bash
sha256sum -c SHA256SUMS.txt        # 见下：改过的文件必须同步更新清单
node tests/core.cjs                # 期望 {"passed":42,...}
node tests/regression.cjs          # 期望 {"passed":10}
python rebuild.py && git diff --exit-code -- index.html
```

`SHA256SUMS.txt` 覆盖除自身以外的**全部**跟踪文件。任何被清单覆盖的文件改动后，必须重新生成对应行，否则第一条自检失败：

```bash
sha256sum <改动文件>    # 用新值替换清单中该文件的行
```

其余测试（`tests/browser.cjs`、`tests/ios-mobile.cjs`、`tests/advanced.cjs`、`tests/coach-browser.cjs` 等）需要 Playwright 与真实浏览器，**不在 CI 中运行**；它们跑不起来不构成跳过 `core`/`regression` 的理由。

## 硬性边界

- **未经明确要求，不要 `git commit`、`git push`，也不要触发任何部署。** 改完先给出 `git diff` 摘要与影响面，等确认。
- **不要修改线上部署。** 应用已发布在 WorkBuddy 托管域，部署是独立的人工动作，与仓库提交互不影响。
- **不要提交环境脚本。** `setup-tools/` 之类用于云端沙箱初始化的文件属于运行环境，不属于项目内容。
- **不要提交个人训练记录。** `PERSONAL_TRAINING_SPEC_v0.4.md` 已在 `.gitignore` 中，属本地私有内容。
- **不要改变既有数据结构语义**：`localStorage` 主键 `response-autonomy-v01`、`schemaVersion: 3`、FSRS 状态字段、导入/导出的 JSON 形状。迁移逻辑见 `data.js` 与 `tests/regression.cjs`。
- **安全红线**：插入 DOM 的用户文本与模型输出必须经 `safe()` 转义；`**加粗**` 的替换只能在转义**之后**进行。已有 XSS 回归用例，不要绕过。

## 可选阅读

- `README.md`：功能、保存与恢复边界、模块清单
- `TRAINING_DESIGN.md`：训练设计原则（为什么这样出题）
- `DELIVERY_v0.8.1.md`：最新一版验收记录与实测证据

## 学习功能设计

遵循 `TRAINING_DESIGN.md` 的自然习得原则：结构化知识与因果 → 独立实操与反馈 → 巩固、条件变式与现实迁移。公式应随事实、规则、影响和需要调整；不把沟通训练承诺为焦虑治疗。交付前复核设计目的，优先复用既有机制和修复根因，避免补丁叠加。
