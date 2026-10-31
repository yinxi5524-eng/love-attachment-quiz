/* 从用户修改后的单文件 HTML 反向提取源码
 * 输出到 sync-out/：style.css, data-questions.js, data-results.js, app.js, index.html(还原为多文件引用形态)
 */
const fs = require("fs");
const path = require("path");

const root = __dirname;
const html = fs.readFileSync(path.join(root, "依恋类型测试.html"), "utf8");
const outDir = path.join(root, "sync-out");
fs.mkdirSync(outDir, { recursive: true });

/* ---- 提取所有 <style> 块 ---- */
const styles = [...html.matchAll(/<style>\n?([\s\S]*?)\n?<\/style>/g)].map(m => m[1]);
console.log("style blocks:", styles.length);
const css = styles.join("\n\n");
fs.writeFileSync(path.join(outDir, "style.css"), css, "utf8");

/* ---- 提取所有内联 <script> 块并按内容识别 ---- */
const scripts = [...html.matchAll(/<script>\n?([\s\S]*?)\n?<\/script>/g)].map(m => m[1]);
console.log("inline script blocks:", scripts.length);

const idOf = (s) => {
  if (s.includes("ECR-R 亲密关系经历量表")) return "data-questions.js";
  if (s.includes("结果内容数据")) return "data-results.js";
  if (s.includes("应用逻辑")) return "app.js";
  return null;
};

const jsSrc = {};
const unknown = [];
for (const s of scripts) {
  const id = idOf(s);
  if (id) jsSrc[id] = s; else unknown.push(s.slice(0, 100));
}
if (unknown.length) console.log("UNKNOWN script blocks:", JSON.stringify(unknown, null, 1));
for (const id of ["data-questions.js", "data-results.js", "app.js"]) {
  if (!jsSrc[id]) { console.error("MISSING:", id); process.exit(1); }
  fs.writeFileSync(path.join(outDir, id), jsSrc[id], "utf8");
}

/* ---- 还原 index.html：style→link，script→src 引用（保持原顺序） ---- */
let out = html;
// 先把所有 script 块替换成对应 src 引用
out = out.replace(/<script>\n?([\s\S]*?)\n?<\/script>/g, (m, body) => {
  const id = idOf(body);
  return id ? "<script src=\"js/" + id + "\"></script>" : m;
});
// style 块：第一个换成 link，其余删除（css 已合并进 style.css）
let styleReplaced = false;
out = out.replace(/<style>\n?[\s\S]*?\n?<\/style>/g, (m) => {
  if (!styleReplaced) { styleReplaced = true; return "<link rel=\"stylesheet\" href=\"css/style.css\">"; }
  return "";
});
fs.writeFileSync(path.join(outDir, "index.html"), out, "utf8");

console.log("extracted ->", outDir);
console.log("index.html refs check:", /<link rel="stylesheet" href="css\/style.css">/.test(out) && /<script src="js\/data-questions.js"><\/script>/.test(out));
