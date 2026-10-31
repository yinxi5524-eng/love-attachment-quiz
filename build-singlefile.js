/* 单文件打包脚本：把 css/js 全部内联进一个 HTML，双击即可离线打开
 * 用法: node build-singlefile.js  →  输出 依恋类型测试.html
 */
const fs = require("fs");
const path = require("path");

const root = __dirname;
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");

let html = read("index.html");

// 内联 CSS
html = html.replace(
  /<link rel="stylesheet" href="css\/style.css">/,
  () => "<style>\n" + read("css/style.css") + "\n</style>"
);

// 内联全部本地 <script src>
html = html.replace(
  /<script src="(js\/[^"]+)"><\/script>/g,
  (m, src) => "<script>\n" + read(src) + "\n</script>"
);

// 校验：不允许残留外部引用
if (/rel="stylesheet"|<script src=/.test(html)) {
  console.error("FAILED: still has external refs");
  process.exit(1);
}

// 仅当 index.html 尚无版本注释时才加 banner（避免重复）
if (!html.includes("单文件离线版")) {
  const banner = "<!-- 依恋类型测试 · 单文件离线版 · 题源: ECR-R (Fraley, Waller, & Brennan, 2000) · 生成时间: " +
    new Date().toLocaleString("zh-CN") + " -->\n";
  html = html.replace("<!DOCTYPE html>", "<!DOCTYPE html>\n" + banner);
}

const out = path.join(root, "依恋类型测试.html");
fs.writeFileSync(out, html, "utf8");
console.log("OK ->", out, "(" + Math.round(html.length / 1024) + " KB)");
