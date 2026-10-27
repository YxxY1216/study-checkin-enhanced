# 📚 每日学习打卡 · 增强版

一个纯前端的学习打卡应用，帮助考研/大学生高效管理每日学习任务，追踪学习进度与习惯养成。

[![GitHub](https://img.shields.io/badge/GitHub-study--checkin--enhanced-blue)](https://github.com/YxxY1216/study-checkin-enhanced)

---

## 🚀 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | 原生 HTML5 + CSS3 + Vanilla JavaScript（零依赖） |
| 数据持久化 | localStorage（浏览器本地存储） |
| 图表渲染 | SVG（自定义绘制，无第三方图表库） |
| 动画效果 | CSS Transitions + cubic-bezier 缓动（iOS 风格弹簧动画） |
| 视觉风格 | Glassmorphism（毛玻璃）、CSS 变量主题系统 |
| 响应式布局 | Flexbox + Sticky 定位 |

**文件规模：** ~1400 行单文件应用，无构建步骤，双击即可运行。

---

## ✨ 核心功能

### 📝 任务管理
- **四科分类**：英语 / 数学 / 政治 / C语言，每科独立任务列表
- **任务 CRUD**：新增、编辑、删除任务，支持 Markdown 格式描述
- **完成状态**：点击标记完成/未完成，带动画反馈
- **进度显示**：实时显示每科完成百分比
- **自动折叠**：展开一个科目时自动收起其他科目

### 📊 数据可视化
- **水平条形图**：以 8 小时（480 分钟）为基准，展示各科当日学习时长占比
- **多线趋势图**：每科一条线（红/蓝/琥珀/绿），支持近 7 天 / 近 30 天切换
- **日历热图**：高亮显示有学习记录的日期
- **学科图例**：趋势图底部彩色图例，悬停显示详细数据

### 🔥 习惯追踪
- **连续天数**：记录每日学习 streak，带火焰徽章动画
- **历史归档**：自动保存最近 120 条历史记录

### ⏰ 考研倒计时
- 距考研日期实时倒计时（天/时/分/秒）
- Header 栏常驻显示

### ⏲️ 学习计时器
- 选择科目 + 输入分钟数开始计时
- 计时结束自动将时长均分给该科目未完成的任务（以 h:m 格式记录）
- 计时过程中页面标题实时刷新

### 💬 每日提醒
- 可选开启每日推送提醒（基于 Notification API）
- 自定义提醒时间（默认 22:00）
- 需用户手动授权通知权限

### 💾 数据管理
- **导出**：将全部打卡数据导出为 JSON 文件
- **导入**：从 JSON 文件恢复数据，支持跨设备迁移

### ⚙️ 个性化设置
- 自定义考研目标日期
- 主题色：紫蓝渐变 Header

---

## 📁 项目结构

```
study-checkin-enhanced/
├── index.html      # 单文件应用（HTML+CSS+JS 合一）
└── .gitignore      # Git 忽略规则
```

---

## 🛠️ 使用方法

### 本地运行
1. 克隆仓库或直接下载 `index.html`
2. 用浏览器直接打开（无需服务器）
3. 开始记录你的学习任务！

### 部署到 GitHub Pages
```bash
# 推送代码到 GitHub
git add .
git commit -m "chore: update"
git push origin master

# 在仓库 Settings → Pages 中启用 GitHub Pages
```

---

## 🎨 设计亮点

- **毛玻璃按钮**：所有操作按钮采用 `backdrop-filter: blur()` 实现玻璃质感
- **iOS 弹簧动画**：科目展开/收起使用 `cubic-bezier(0.34, 1.56, 0.64, 1)` 曲线
- **渐变色 Header**：紫蓝渐变主题，视觉醒目
- **响应式布局**：左侧主内容 + 右侧固定面板，适配不同屏幕尺寸

---

## 📝 数据格式

### localStorage 键名
| 键名 | 内容 |
|------|------|
| `checkin_YYYY-MM-DD` | 今日任务状态 |
| `checkin_history` | 历史记录数组（最多 120 条） |
| `checkin_streak` | 连续天数统计 |
| `checkin_reminder` | 提醒配置 |

### 历史记录结构
```json
{
  "date": "2026-10-27",
  "data": {
    "english_0": { "completed": true, "durationMin": 90 },
    "math_1": { "completed": false, "durationMin": 0 }
  },
  "createdAt": "2026-10-27T14:00:00Z",
  "updatedAt": "2026-10-27T14:30:00Z"
}
```

---

## 🔐 安全说明

本项目使用 GitHub Personal Access Token 推送代码。**请定期轮换 Token**，并妥善保管：

- ✅ 当前使用 Token：`study-checkin-enhanced-2`（scope: `repo`）
- ⚠️ 旧 Token（已泄露）：`study-checkin-enhanced`（scope: `public access`）→ 请手动删除

删除地址：https://github.com/settings/tokens

---

## 📄 License

MIT License

---

## 🙌 贡献

欢迎提 Issue 或 Pull Request！

---

*祝你考研顺利，每天进步一点点！🎓*
