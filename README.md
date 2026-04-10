# beige Website - Static Upload Ready

## 文件结构

```
beige-website/
├── index.html          # 首页
├── about.html          # 品牌页
├── css/
│   └── style.css       # 主样式表
├── js/
│   └── main.js         # 主脚本
└── README.md           # 本文件
```

## 现在的图片接入方式

商品图已经改成固定目录自动读取，你后续不需要再改 `HTML` 或 `JS`。

推荐目录规则：

```text
images/products/<product-id>-<商品名>/PRODUCT MAIN IMAGE 1.png
images/products/<product-id>-<商品名>/PRODUCT MAIN IMAGE 2.png
images/products/<product-id>-<商品名>/PRODUCT MAIN IMAGE 3.png
images/products/<product-id>-<商品名>/PRODUCT MAIN IMAGE 4.png
```

支持格式：

- `.webp`
- `.png`
- `.jpg`
- `.jpeg`
- `.avif`

示例：

```text
images/products/1-餐盘推车/PRODUCT MAIN IMAGE 1.png
images/products/1-餐盘推车/PRODUCT MAIN IMAGE 2.png
images/products/1-餐盘推车/PRODUCT MAIN IMAGE 3.png
images/products/1-餐盘推车/PRODUCT MAIN IMAGE 4.png
```

说明：

- `collections.html` 的商品卡主图会自动读取 `PRODUCT MAIN IMAGE 1.*`
- `product-detail.html` 会自动读取 `PRODUCT MAIN IMAGE 1.* ~ PRODUCT MAIN IMAGE 4.*`
- 同时仍兼容旧规则：`images/products/<id>/card.*`、`detail-1.* ~ detail-4.*`
- 只要文件名正确，上传整站后会直接生效

详细说明见 [images/products/UPLOAD-GUIDE.txt](/Users/suprodog/Downloads/beige-website(5)/images/products/UPLOAD-GUIDE.txt)。

## 已完成内容

### ✅ 首页 (index.html)
- 导航栏（含语言切换、下拉菜单）
- Hero Banner 首屏
- 品牌理念区
- 产品分类展示（4个分类卡片）
- 核心价值展示（4个价值点）
- 精选产品展示（3个产品卡片）
- 安全品质预告区
- 生活方式场景图
- 页脚（含社交链接、导航、联系信息）

### ✅ 品牌页 (about.html)
- 页面标题区
- 品牌故事（图文布局）
- 品牌使命宣言
- 设计理念（4个原则）
- 设计流程（4个步骤）
- 核心价值观（3个价值块）
- 团队/文化区（可选）
- CTA 引导区
- 页脚

### ✅ 样式系统 (style.css)
- CSS 变量定义（品牌色彩、字体、间距）
- 响应式网格系统
- 导航样式
- 按钮、链接组件
- 各区块样式
- 移动端适配（断点：1024px, 768px, 480px）

### ✅ 交互功能 (main.js)
- 移动端菜单切换
- 导航栏滚动效果
- 平滑滚动
- 滚动渐入动画
- 下拉菜单优化

---

## 如何编辑

### 替换占位符

所有需要替换的内容都用 `[方括号]` 标注，例如：

```html
<!-- 替换图片 -->
<div class="image-placeholder">
    <span>[HERO BACKGROUND IMAGE]</span>
    <small>Recommended: 1920×1080px...</small>
</div>

<!-- 替换文字 -->
<h1 class="hero-title">
    [MAIN HEADLINE]<br>
    <span class="hero-subtitle">[SUBHEADLINE]</span>
</h1>

<!-- 替换链接 -->
<a href="#" class="btn btn-primary">[CTA BUTTON TEXT]</a>
```

### 替换商品图的方法

现在推荐直接上传到 `images/products/` 目录，不再手动改页面代码。

```text
images/products/25-C30婴儿推车/PRODUCT MAIN IMAGE 1.png
images/products/25-C30婴儿推车/PRODUCT MAIN IMAGE 2.png
images/products/25-C30婴儿推车/PRODUCT MAIN IMAGE 3.png
images/products/25-C30婴儿推车/PRODUCT MAIN IMAGE 4.png
```

### 其他版块替换图片的方法

**方法1：直接替换 HTML**
```html
<!-- 从 -->
<div class="image-placeholder">
    <span>[HERO BACKGROUND IMAGE]</span>
</div>

<!-- 改为 -->
<img src="images/hero-banner.jpg" alt="Mother and baby traveling">
```

**方法2：使用背景图（推荐用于装饰性图片）**
```css
.hero-bg {
    background-image: url('../images/hero-banner.jpg');
    background-size: cover;
    background-position: center;
}
```

### 修改品牌色彩

编辑 `css/style.css` 顶部的 CSS 变量：

```css
:root {
    --color-cream: #F5F0E8;        /* 主奶油色 */
    --color-beige: #D4C4B0;        /* 米色 */
    --color-gold: #C9A962;         /* 香槟金点缀 */
    /* ... 其他颜色 */
}
```

---

## 下一步（Phase 2）

### 待创建页面

1. **collections.html** - 产品系列页
   - 产品分类网格
   - 筛选功能
   - 产品卡片列表

2. **product-detail.html** - 单产品详情页
   - 产品图片画廊
   - 规格参数表
   - 购买平台链接（Shopee/Lazada/TikTok）
   - 相关产品推荐

3. **safety.html** - 安全与品质页
   - 安全认证展示
   - 测试流程说明
   - 材质说明

4. **contact.html** - 联系页
   - 联系表单
   - 地图（可选）
   - 合作咨询信息

---

## 预览网站

直接在浏览器中打开 `index.html` 文件即可预览。

或使用本地服务器：
```bash
cd beige-website
python -m http.server 8000
# 然后访问 http://localhost:8000
```

## 直接上传部署

这是一个纯静态网站，没有构建步骤，上传整个项目目录即可部署。

可直接上传的内容包括：

- `index.html`
- `about.html`
- `collections.html`
- `product-detail.html`
- `contact.html`
- `css/`
- `js/`
- `images/`

常见方式：

- 上传到宝塔 / 虚拟主机的网站根目录
- 上传到 Vercel / Netlify / Cloudflare Pages
- 上传到对象存储静态网站托管

---

## 注意事项

1. **商品图片**：优先按 `images/products/<id>/` 规则放图
2. **图片优化**：建议优先使用 WebP
3. **字体**：当前使用 Google Fonts，如需离线请自行下载
4. **SEO**：上线前可继续补充 meta 信息
