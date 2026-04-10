# Static Deploy Guide

## 方案 1：直接上传到服务器

这是纯静态网站，不需要打包。

直接把以下文件和文件夹上传到网站根目录即可：

- `index.html`
- `about.html`
- `collections.html`
- `product-detail.html`
- `contact.html`
- `css/`
- `js/`
- `images/`

适用场景：

- 宝塔面板
- 虚拟主机
- FTP / SFTP
- OSS / COS / R2 静态网站托管

## 方案 2：Vercel / Netlify / Cloudflare Pages

把整个项目推到 Git 仓库后直接导入即可，无需构建命令。

推荐设置：

- Build Command: 留空
- Output Directory: `/`
- Framework Preset: `Other`

如果是 Cloudflare Pages，建议改成：

- Build Command: `bash build.sh`
- Build output directory: `dist`
- Root directory: 留空

这样会先把站点复制到干净的 `dist/`，避免把 `.git` 一起打包上传。

## 商品图片上传规则

商品卡主图和详情页四张图都按固定目录读取：

```text
images/products/<product-id>-<商品名>/PRODUCT MAIN IMAGE 1.png
images/products/<product-id>-<商品名>/PRODUCT MAIN IMAGE 2.png
images/products/<product-id>-<商品名>/PRODUCT MAIN IMAGE 3.png
images/products/<product-id>-<商品名>/PRODUCT MAIN IMAGE 4.png
```

支持后缀：

- `.webp`
- `.png`
- `.jpg`
- `.jpeg`
- `.avif`

例如商品 `25`：

```text
images/products/25-C30婴儿推车/PRODUCT MAIN IMAGE 1.png
images/products/25-C30婴儿推车/PRODUCT MAIN IMAGE 2.png
images/products/25-C30婴儿推车/PRODUCT MAIN IMAGE 3.png
images/products/25-C30婴儿推车/PRODUCT MAIN IMAGE 4.png
```

兼容旧规则：

```text
images/products/<product-id>/card.png
images/products/<product-id>/detail-1.png
images/products/<product-id>/detail-2.png
images/products/<product-id>/detail-3.png
images/products/<product-id>/detail-4.png
```

## 当前项目结构

```
beige-website/
├── index.html          # 首页
├── about.html          # 关于页
├── collections.html    # 产品系列
├── product-detail.html # 产品详情
├── css/
│   └── style.css       # 样式文件
├── images/
│   └── products/       # 商品图片目录
└── js/
    ├── i18n.js         # 翻译文件
    ├── main.js         # 主脚本
    ├── collections.js  # 产品筛选
    ├── product.js      # 产品详情动态加载
    └── product-media.js # 商品图片自动读取
```

## 部署前检查清单

- [ ] `images/products/<id>/` 中的商品图已上传
- [ ] 商品卡主图和详情 4 张图命名正确
- [ ] Shopee/TikTok 链接已添加
- [ ] 联系信息已更新

## 上传后验证

1. 打开 `collections.html`，确认商品卡主图正常显示
2. 打开任意 `product-detail.html?id=商品ID`，确认 4 张详情图可以切换
3. 手机端点开详情图，确认灯箱预览正常

## 备注

- 商品图片未上传时，页面会显示占位提示和目标路径
- 整站可直接上传，无需 `npm install` 或 `npm run build`
