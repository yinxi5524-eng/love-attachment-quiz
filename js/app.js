/* ============================================================
 * 恋爱依恋类型测试 · 应用逻辑
 * 计分: 官方 ECR-R 计分键（反向题 8-x，两维度取均分 1-7）
 * ============================================================ */
(function () {
  "use strict";

  var $ = function (s) { return document.querySelector(s); };
  var VERSION = "ecrr-zh-reference-20261031-r2";
  var STORE_ANS = "ecrr_answers_v2", STORE_RES = "ecrr_result_v2", STORE_PREF = "ecrr_save_enabled";
  var MID = 4;
  var LABELS = ["完全不符合", "比较不符合", "有点不符合", "中立", "有点符合", "比较符合", "完全符合"];
  var answers = new Array(QUESTIONS.length).fill(null), qIdx = 0, curType = null;
  var currentResult = null, renderToken = 0, saveEnabled = true, storageAvailable = true;
  function status(text) { $("#storage-status").textContent = text; }
  function readRaw(key) {try{return localStorage.getItem(key);}catch(e){storageAvailable=false;return null;}}
  function writeRaw(key,value) {try{localStorage.setItem(key,value);return true;}catch(e){storageAvailable=false;status("本次无法保存记录，你仍可完成测试；关闭页面后进度可能丢失。");return false;}}
  function removeRaw(key) {try{localStorage.removeItem(key);return true;}catch(e){storageAvailable=false;return false;}}
  function parseSaved(key) {try{return JSON.parse(readRaw(key)||"null");}catch(e){removeRaw(key);return null;}}
  function validValue(v) {return Number.isInteger(v) && v>=1 && v<=7;}
  function validAnswers(a,complete) {return Array.isArray(a)&&a.length===36&&a.every(function(v){return validValue(v)||(!complete&&v===null);});}
  function validScore(v) {return typeof v==="number"&&Number.isFinite(v)&&v>=1&&v<=7;}
  function percent(v) {return (v-1)/6*100;}
  function resultName(r) {if(r&&(r.anx===4||r.avo===4))return "处于参考线上";return TYPES[r?r.type:curType].name;}
  function showScreen(id) {
    document.querySelectorAll(".screen").forEach(function(s){s.classList.remove("active");});
    $(id).classList.add("active"); window.scrollTo(0,0);
  }
  function saveAnswers(){if(saveEnabled)writeRaw(STORE_ANS,JSON.stringify({version:VERSION,answers:answers}));}
  function loadSaved(){if(!saveEnabled)return null;var a=parseSaved(STORE_ANS);if(a&&a.version===VERSION&&validAnswers(a.answers,false))return a.answers;return null;}
  function typeOf(anx,avo){var hiA=anx>MID,hiV=avo>MID;if(hiA&&hiV)return "fearful";if(hiA)return "anxious";if(hiV)return "avoidant";return "secure";}
  function scoreArray(a){
    if(!validAnswers(a,true))return null;
    var anx=0,avo=0;QUESTIONS.forEach(function(q,i){var v=q.rev?8-a[i]:a[i];if(q.dim==="anx")anx+=v;else avo+=v;});
    return {anx:anx/18,avo:avo/18};
  }
  function computeScores(){return scoreArray(answers);}
  function loadResult(){
    if(!saveEnabled)return null;var r=parseSaved(STORE_RES);
    if(!r||r.version!==VERSION||!validScore(r.anx)||!validScore(r.avo))return null;
    return {version:VERSION,type:typeOf(r.anx,r.avo),anx:r.anx,avo:r.avo,date:typeof r.date==="string"?r.date.slice(0,32):""};
  }
  function refreshCover(){
    var a=loadSaved(),n=a?a.filter(validValue).length:0;
    $("#resume-num").textContent=n;
    $("#btn-resume").classList.toggle("hidden",!a||n===0);
    $("#btn-resume").firstChild.textContent=n===36?"检查已完成答案（":"继续上次进度（";
    $("#btn-lastresult").classList.toggle("hidden",!currentResult&&!loadResult());
  }
  function clearRecords(){
    var ok=true;[STORE_ANS,STORE_RES,"ecrr_answers_v1","ecrr_result_v1","ecrr_error"].forEach(function(k){if(!removeRaw(k))ok=false;});
    currentResult=null;return ok;
  }
  function startNew(){renderToken++;answers=new Array(36).fill(null);qIdx=0;currentResult=null;removeRaw(STORE_RES);saveAnswers();showScreen("#screen-quiz");renderQuestion(true);}
  function initCover(){
    saveEnabled=readRaw(STORE_PREF)!=="false";$("#save-progress").checked=saveEnabled;
    // v1 used different wording and classification; do not reinterpret its answers.
    if(readRaw("ecrr_answers_v1")||readRaw("ecrr_result_v1"))status("页面已修订题目说明与图示。旧版记录不作新版结果解读，请重新作答；可用下方按钮清除旧记录。");
    if(!storageAvailable)status("本次无法读取浏览器记录，你仍可完成测试；进度仅在当前页面保留。");
    currentResult=loadResult();refreshCover();
    $("#btn-start").onclick=function(){if(loadSaved()&&!confirm("开始新的测试将覆盖已保存的本次进度，确定继续吗？"))return;startNew();};
    $("#btn-resume").onclick=function(){var a=loadSaved();if(!a)return;answers=a.slice();qIdx=answers.indexOf(null);if(qIdx<0)qIdx=35;showScreen("#screen-quiz");renderQuestion(true);};
    $("#btn-lastresult").onclick=function(){var r=currentResult||loadResult();if(r){currentResult=r;renderResult(r.type,r.anx,r.avo,false);}};
    $("#save-progress").onchange=function(){saveEnabled=this.checked;if(!saveEnabled){clearRecords();status("已关闭保存。答案仅在当前页面保留；如浏览器禁止清除，需在浏览器设置中删除记录。");}else status("已开启在此浏览器保存。你可以随时清除记录。");writeRaw(STORE_PREF,String(saveEnabled));refreshCover();};
    $("#btn-clear").onclick=function(){if(!confirm("清除本页在此浏览器保存的答案和结果？"))return;renderToken++;var ok=clearRecords();answers=new Array(36).fill(null);qIdx=0;status(ok?"本地答案和结果已清除。":"浏览器未允许清除记录，请在浏览器设置中删除本站点数据。");refreshCover();};
  }
  function renderQuestion(focus){
    var q=QUESTIONS[qIdx],card=$("#quiz-card");
    card.classList.remove("leaving","entering");
    $("#quiz-dim-tag").textContent="亲密关系自评 · 第 "+(qIdx+1)+" 题";
    $("#quiz-dim-tag").className="quiz-tag";
    $("#quiz-text").textContent=q.id+". "+q.text;
    var box=$("#quiz-options");box.innerHTML="";
    LABELS.forEach(function(label,i){var v=i+1,b=document.createElement("button");b.type="button";b.className="opt";b.setAttribute("aria-label",v+" 分："+label);b.setAttribute("aria-pressed",String(answers[qIdx]===v));
      var num=document.createElement("span"),text=document.createElement("span");num.className="opt-num";num.textContent=v;text.className="opt-label";text.textContent=label;b.appendChild(num);b.appendChild(text);
      if(answers[qIdx]===v)b.classList.add("picked");b.onclick=function(){pick(v,b);};box.appendChild(b);});
    $("#quiz-idx").textContent=qIdx+1;$("#btn-prev").disabled=qIdx===0;
    $("#btn-next").textContent=qIdx===35?"查看结果 →":"下一题 →";
    $("#review-hint").textContent=qIdx===35?"提交前可用左上角返回，检查或修改答案。":"选择后确认进入下一题，也可用键盘 1–7 选分。";
    updateProgress();if(focus)$("#quiz-text").focus({preventScroll:true});
  }
  function updateProgress(){var n=answers.filter(validValue).length;$("#progress-fill").style.width=n/36*100+"%";$("#quiz-progress").setAttribute("aria-valuenow",n);$("#btn-next").disabled=!validValue(answers[qIdx]);}
  function pick(v,btn){if(!validValue(v))return;answers[qIdx]=v;$("#quiz-options").querySelectorAll("button").forEach(function(b,i){var chosen=i+1===v;b.classList.toggle("picked",chosen);b.setAttribute("aria-pressed",String(chosen));});saveAnswers();updateProgress();}
  function nextQuestion(){if(!validValue(answers[qIdx]))return;if(qIdx===35){finish();return;}qIdx++;renderQuestion(true);}
  function initQuiz(){
    $("#btn-prev").onclick=function(){if(qIdx>0){qIdx--;renderQuestion(true);}};
    $("#btn-next").onclick=nextQuestion;
    $("#btn-restart").onclick=function(){if(confirm("重新开始将清空当前进度，确定继续吗？"))startNew();};
    document.addEventListener("keydown",function(e){
      if(!$("#screen-quiz").classList.contains("active")||e.repeat||e.ctrlKey||e.metaKey||e.altKey)return;
      if(/^[1-7]$/.test(e.key)){e.preventDefault();var v=Number(e.key);pick(v);$("#quiz-options").children[v-1].focus();}
      if(e.key==="ArrowLeft"&&qIdx>0){e.preventDefault();qIdx--;renderQuestion(true);}
      if(e.key==="ArrowRight"){e.preventDefault();nextQuestion();}
    });
  }
  function finish(){
    var s=computeScores();if(!s){qIdx=answers.findIndex(function(v){return !validValue(v);});if(qIdx<0)qIdx=0;renderQuestion(true);$("#review-hint").textContent="请先完成所有题目，再查看结果。";return;}
    var t=typeOf(s.anx,s.avo);currentResult={version:VERSION,type:t,anx:s.anx,avo:s.avo,date:new Date().toLocaleDateString("zh-CN")};
    if(saveEnabled)writeRaw(STORE_RES,JSON.stringify(currentResult));renderResult(t,s.anx,s.avo,true);
  }

  /* ---------------- 结果渲染 ---------------- */
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  function animNum(el, target, dur) {
    if (document.hidden) { el.textContent = target.toFixed(2); return; }  // 后台页直接显示终值
    var token = renderToken;
    var t0 = Date.now();
    var step = function () {
      if (token !== renderToken) return;
      var p = clamp((Date.now() - t0) / dur, 0, 1);
      p = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * p).toFixed(2);
      if (p < 1) setTimeout(step, 30);
    };
    step();
  }

  function renderResult(typeKey, anx, avo, fresh) {
    renderToken++;
    var T = TYPES[typeKey];
    curType = typeKey;
    currentResult = {version: VERSION, type:typeKey, anx:anx, avo:avo, date:(currentResult && currentResult.date) || new Date().toLocaleDateString("zh-CN")};

    /* 类型色注入 */
    var root = document.documentElement.style;
    root.setProperty("--t1", T.gradient[0]);
    root.setProperty("--t2", T.gradient[1]);
    root.setProperty("--t-light", T.colorLight);
    root.setProperty("--t-dark", T.colorDark);

    $("#hero-icon").textContent = T.icon;
    $("#hero-name").textContent = resultName(currentResult);
    $("#hero-alias").textContent = "图示参考区域 · 中心 4 并非类型界线";
    $("#hero-tagline").textContent = anx === 4 || avo === 4 ? "有维度恰在参考线上，请结合两维分数理解" : "「" + T.tagline + "」";

    /* 分数条 */
    $("#bar-anx").style.width = "0%";
    $("#bar-avo").style.width = "0%";
    $("#bar-anx").style.width = percent(anx) + "%";
    $("#bar-avo").style.width = percent(avo) + "%";
    animNum($("#num-anx"), anx, 1100);
    animNum($("#num-avo"), avo, 1100);

    /* 四象限落点（x=回避 →，y=焦虑 ↑） */
    var dot = $("#q-dot");
    dot.style.left = percent(avo) + "%";
    dot.style.bottom = percent(anx) + "%";
    $("#quadrant").setAttribute("role", "img");
    $("#quadrant").setAttribute("aria-label", "横轴回避 " + avo.toFixed(2) + "，纵轴焦虑 " + anx.toFixed(2) + "；中心为 4，仅作示意。");

    /* 边界提示 */
    $("#borderline-note").textContent = "💡 中点 4 仅作图示参考，不是经过验证的类型界线。请优先看连续分数；靠近中点不代表灵活，远离中点也不能确定某种行为。";

    /* 深度解读 */
    $("#ov-title").textContent = "🔍 关于「" + T.name + "」";
    var ov = $("#overview");
    ov.innerHTML = "";
    T.overview.forEach(function (p) {
      var el = document.createElement("p");
      el.textContent = p;
      ov.appendChild(el);
    });
    var aq = document.createElement("div");
    aq.className = "academic-quote";
    aq.innerHTML = "<b>学术定义</b> · " + T.academic;
    ov.appendChild(aq);

    /* 场景 */
    var sc = $("#scenes");
    sc.innerHTML = "";
    T.scenarios.forEach(function (s) {
      var el = document.createElement("div");
      el.className = "scene";
      el.innerHTML = '<div class="scene-icon">' + s.icon + '</div><div><b>' + s.title + '</b><p>' + s.text + '</p></div>';
      sc.appendChild(el);
    });

    /* 成长建议 */
    var gr = $("#growth");
    gr.innerHTML = "";
    T.growth.forEach(function (t) {
      var el = document.createElement("div");
      el.className = "tip";
      el.textContent = t;
      gr.appendChild(el);
    });

    /* 相处指南 Tabs */
    renderGuideTabs(typeKey);

    /* 匹配 */
    var ml = $("#match-list");
    ml.innerHTML = "";
    MATCH[typeKey] && Object.keys(MATCH[typeKey]).forEach(function (pk) {
      var m = MATCH[typeKey][pk], P = TYPES[pk];
      
      var el = document.createElement("div");
      el.className = "match";
      el.innerHTML =
        '<div class="match-head"><b>' + P.icon + " " + P.name + '</b>' +
        
        '<span class="match-level" style="background:' + levelColor(m.level) + '">' + m.level + '</span></div>' +
        '<p>' + m.text + '</p>';
      ml.appendChild(el);
    });

    /* 参考文献 */
    var rf = $("#refs");
    rf.innerHTML = "";
    REFS.forEach(function (r) {
      var li = document.createElement("li");
      li.innerHTML = r;
      rf.appendChild(li);
    });

    showScreen("#screen-result");
    $("#hero-name").focus({preventScroll:true});
  }

  function levelColor(level) {
    var map = { "契合": "#5FA777", "治愈": "#5FA777", "互补": "#5FA777", "土壤": "#5FA777", "渡人": "#7FA96B", "共振": "#E8A15C", "合租": "#E8A15C", "过山车": "#E8A15C", "静默": "#E8A15C", "镜像": "#E8A15C", "消耗": "#D9776B", "互耗": "#D9776B", "陷阱": "#D9776B" };
    return map[level] || "#A39A8E";
  }

  /* ---------------- 相处指南 ---------------- */
  function renderGuideTabs(activeKey) {
    var tabs = $("#guide-tabs");
    tabs.innerHTML = "";
    var body = $("#guide-body");

    var paint = function (key) {
      var G = GUIDE[key];
      var html = '<div class="guide-head"><b>' + G.icon + " " + G.name.replace(/^与|相处$/g, "") + '</b>';
      G.traits.forEach(function (t) { html += '<span class="trait">' + t + '</span>'; });
      html += '</div>';
      html += '<div class="guide-sec"><h4 class="ok">可以一起尝试</h4><ul>';
      G.dos.forEach(function (d) { html += '<li class="ok">' + d + '</li>'; });
      html += '</ul></div><div class="guide-sec"><h4 class="no">需要留意</h4><ul>';
      G.donts.forEach(function (d) { html += '<li class="no">' + d + '</li>'; });
      html += '</ul></div>';
      body.innerHTML = html;
      body.classList.remove("tab-body"); void body.offsetWidth; body.classList.add("tab-body");
    };

    Object.keys(GUIDE).forEach(function (key) {
      var b = document.createElement("button");
      b.className = "tab" + (key === activeKey ? " active" : "");
      b.textContent = GUIDE[key].icon + " " + GUIDE[key].name.replace(/^与|相处$/g, "");
      b.onclick = function () {
        tabs.querySelectorAll(".tab").forEach(function (t) { t.classList.remove("active"); });
        b.classList.add("active");
        paint(key);
      };
      tabs.appendChild(b);
    });
    paint(activeKey);
  }

  /* ---------------- 分享卡片 ---------------- */
  function rr(ctx, x, y, w, h, r) {
    r = Math.max(0, Math.min(r, w / 2, h / 2));
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function drawCard() {
    var T = Object.assign({}, TYPES[curType], {name:resultName(currentResult)});
    var r = currentResult;
    if (!r) return "";
    var W = 1080, H = 1620;
    var c = document.createElement("canvas");
    c.width = W; c.height = H;
    var ctx = c.getContext("2d");
    var FONT = '"PingFang SC","HarmonyOS Sans SC","Microsoft YaHei",sans-serif';

    /* 背景 */
    var bg = ctx.createLinearGradient(0, 0, W * .3, H);
    bg.addColorStop(0, T.gradient[0]);
    bg.addColorStop(1, T.gradient[1]);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    /* 装饰圆 */
    ctx.fillStyle = "rgba(255,255,255,.10)";
    ctx.beginPath(); ctx.arc(950, 160, 190, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.arc(90, 1460, 150, 0, 7); ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,.08)";
    ctx.beginPath(); ctx.arc(120, 260, 90, 0, 7); ctx.fill();

    /* 顶部标签 */
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(255,255,255,.85)";
    ctx.font = "600 34px " + FONT;
    ctx.fillText("💗 恋爱依恋类型测试 · 基于 ECR-R 量表", W / 2, 150);

    /* 图标 + 类型名 */
    ctx.font = "150px " + FONT;
    ctx.fillText(T.icon, W / 2, 360);
    ctx.fillStyle = "#fff";
    ctx.font = "900 72px " + FONT;
    ctx.fillText(T.name, W / 2, 540, W - 160);
    ctx.font = "500 38px " + FONT;
    ctx.fillStyle = "rgba(255,255,255,.88)";
    ctx.fillText("连续分数 · 参考分区并非标准分类", W / 2, 610);
    ctx.font = "600 46px " + FONT;
    ctx.fillStyle = "#fff";
    ctx.fillText(r.anx === 4 || r.avo === 4 ? "有维度位于参考线上，请结合连续分数理解" : T.tagline, W / 2, 700, W - 160);

    /* 白色地图卡 */
    var mx = 100, my = 790, mw = W - 200, mh = 460;
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,.18)"; ctx.shadowBlur = 40; ctx.shadowOffsetY = 14;
    ctx.fillStyle = "#fff";
    rr(ctx, mx, my, mw, mh, 40); ctx.fill();
    ctx.restore();

    ctx.fillStyle = "#33302B";
    ctx.font = "800 36px " + FONT;
    ctx.textAlign = "left";
    ctx.fillText("📍 你的依恋地图", mx + 44, my + 66);

    /* 迷你四象限 */
    var qx = mx + 44, qy = my + 100, qw = mw - 88, qh = mh - 140;
    ctx.fillStyle = "rgba(232,161,92,.10)";                       // 高焦虑 = 上半
    rr(ctx, qx, qy, qw, qh / 2, 12); ctx.fill();
    ctx.fillStyle = "rgba(110,150,191,.10)";                      // 高回避 = 右半
    rr(ctx, qx + qw / 2, qy, qw / 2, qh, 12); ctx.fill();
    ctx.strokeStyle = "#E3D6C6"; ctx.lineWidth = 2; ctx.setLineDash([10, 8]);
    ctx.beginPath(); ctx.moveTo(qx + qw / 2, qy); ctx.lineTo(qx + qw / 2, qy + qh); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(qx, qy + qh / 2); ctx.lineTo(qx + qw, qy + qh / 2); ctx.stroke();
    ctx.setLineDash([]);

    ctx.textAlign = "left";
    ctx.font = "700 26px " + FONT;
    ctx.fillStyle = "#C57E3D"; ctx.fillText("焦虑-痴迷", qx + 20, qy + 44);
    ctx.fillStyle = "#7E5B9E"; ctx.fillText("恐惧", qx + qw / 2 + 20, qy + 44);
    ctx.fillStyle = "#3E7A54"; ctx.fillText("安全", qx + 20, qy + qh - 20);
    ctx.fillStyle = "#4C7399"; ctx.fillText("疏离-回避", qx + qw / 2 + 20, qy + qh - 20);

    /* 落点 */
    var px = qx + (percent(r.avo) / 100) * qw;
    var py = qy + (1 - (percent(r.anx) / 100)) * qh;
    ctx.fillStyle = T.colorDark;
    ctx.beginPath(); ctx.arc(px, py, 17, 0, 7); ctx.fill();
    ctx.strokeStyle = "#fff"; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(px, py, 17, 0, 7); ctx.stroke();

    /* 分数条（画在渐变背景上） */
    ctx.textAlign = "left";
    var rows = [["依恋焦虑", r.anx], ["回避亲密", r.avo]];
    rows.forEach(function (row, i) {
      var by = 1340 + i * 90;
      ctx.fillStyle = "rgba(255,255,255,.92)";
      ctx.font = "600 34px " + FONT;
      ctx.fillText(row[0], 130, by);
      var bx = 320, bw = 540;
      ctx.fillStyle = "rgba(255,255,255,.30)";
      rr(ctx, bx, by - 22, bw, 26, 13); ctx.fill();
      ctx.fillStyle = "#fff";
      rr(ctx, bx, by - 22, percent(row[1]) / 100 * bw, 26, 13); ctx.fill();
      /* 中点标记 */
      ctx.fillStyle = "rgba(51,48,43,.35)";
      ctx.fillRect(bx + bw / 2 - 1.5, by - 30, 3, 42);
      ctx.fillStyle = "#fff";
      ctx.font = "800 38px " + FONT;
      ctx.textAlign = "right";
      ctx.fillText(row[1].toFixed(2), 960, by);
      ctx.textAlign = "left";
    });

    /* 底部 */
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(255,255,255,.85)";
    ctx.font = "500 30px " + FONT;
    ctx.fillText("36 题中文参考译文 · 分区为示意", W / 2, 1522);
    ctx.fillStyle = "rgba(255,255,255,.60)";
    ctx.font = "400 24px " + FONT;
    ctx.fillText("仅供探索 · 想象作答不作标准解释 · " + (r.date || ""), W / 2, 1572);

    return c.toDataURL("image/png");
  }

  function initShare() {
    var modal = $("#card-modal");
    var lastFocus;
    function closeModal(){ modal.classList.add("hidden"); $("#screen-result").inert = false; if(lastFocus) lastFocus.focus(); }
    $("#btn-share").onclick = function () {
      lastFocus = document.activeElement;
      $("#card-img").src = drawCard();
      modal.classList.remove("hidden");
      $("#screen-result").inert = true;
      $("#btn-close-modal").focus();
    };
    $("#btn-download").onclick = function () {
      var a = document.createElement("a");
      a.href = $("#card-img").src;
      a.download = "依恋类型-" + (curType ? TYPES[curType].name : "") + ".png";
      a.click();
    };
    $("#btn-close-modal").onclick = closeModal;
    modal.querySelector(".modal-mask").onclick = closeModal;
    document.addEventListener("keydown", function(e){
      if(modal.classList.contains("hidden")) return;
      if(e.key === "Escape") {e.preventDefault();closeModal();}
      if(e.key === "Tab") {var first=$("#btn-download"),last=$("#btn-close-modal");if(e.shiftKey && document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey && document.activeElement===last){e.preventDefault();first.focus();}}
    });
  }

  /* ---------------- 重新测试 ---------------- */
  function initRetry() {
    $("#btn-retry").onclick = function () { startNew(); };
    $("#btn-home").onclick = function () {renderToken++; refreshCover(); showScreen("#screen-cover"); $("#btn-start").focus();};
  }

  /* ---------------- 启动 ---------------- */
  initCover();
  initQuiz();
  initShare();
  initRetry();
})();
