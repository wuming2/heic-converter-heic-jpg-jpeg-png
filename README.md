# HEIC to JPG converter

纯前端 HEIC / HEIF 转 JPG、JPEG、PNG 的静态网页应用。

## 功能

- 拖拽或批量选择 `.heic` / `.heif` 文件
- 默认导出 PNG，对解码后的像素无损
- 可选 JPEG / JPG，并支持品质参数
- 优先使用 `heic-to` 解码，旧版 `heic2any` 作为兜底
- 支持 Chrome / Edge 的目录选择保存
- 其他浏览器自动降级为 ZIP 批量下载
- EXIF 清洗开关
- 清洗关闭时，会尽量从 HEIF 容器提取 EXIF 并写入 JPEG
- PNG 输出会写入文本元数据块保存来源文件名、修改时间和原始 EXIF 字符串

## 使用

直接用浏览器打开 `index.html` 即可。推荐通过本地静态服务打开：

```bash
python3 -m http.server 4173 -d outputs/heic-converter
```

然后访问：

```text
http://127.0.0.1:4173
```

## 纯 Web 限制

- HEIC 到 JPEG 需要重新编码，因此 JPEG/JPG 不是严格无损；默认 PNG 是对解码后像素的无损导出。
- 浏览器 File System Access API 目前主要由 Chromium 系浏览器支持；不支持时会使用 ZIP 下载。
- HEIF/HEIC 元数据结构存在设备和厂商差异，EXIF 保留是 best-effort，不等同于专业桌面工具的完整容器级元数据迁移。
- 浏览器 Canvas 导出的 PNG 不暴露压缩级别控制；界面里的压缩等级用于 ZIP 批量包。

## GitHub Pages

这是一个静态站点。推送到 GitHub 后，可以在仓库 Settings -> Pages 中选择 `Deploy from a branch`，分支选择 `main`，目录选择 `/ (root)`。

## License

MIT. Third-party browser libraries are listed in `THIRD_PARTY_NOTICES.md`.
