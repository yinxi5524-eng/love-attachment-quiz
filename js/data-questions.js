/* ============================================================
 * ECR-R 亲密关系经历量表（修订版）中文参考译文
 * 题目来源: Fraley, Waller, & Brennan (2000), ECR-R 官方题集
 * (Fraley 官方页面公布，非商业研究用途免费使用)
 * 编号 1-18 = 依恋焦虑维度；19-36 = 回避亲密维度（官方题序）
 * rev: true = 反向计分题（官方计分键：8 - 原始分）
 * ============================================================ */

const QUESTIONS = [
  // ---------- 依恋焦虑维度 (Anxiety, 18 题) ----------
  { id: 1,  dim: "anx", rev: false, text: "我害怕失去伴侣的爱。" },
  { id: 2,  dim: "anx", rev: false, text: "我常常担心伴侣不愿意继续和我在一起。" },
  { id: 3,  dim: "anx", rev: false, text: "我常常担心伴侣其实并不是真的爱我。" },
  { id: 4,  dim: "anx", rev: false, text: "我担心伴侣在乎我的程度，不如我在乎 TA 那么多。" },
  { id: 5,  dim: "anx", rev: false, text: "我常常希望伴侣对我的感情，能像我对 TA 的感情一样强烈。" },
  { id: 6,  dim: "anx", rev: false, text: "我会非常担心自己的恋爱关系。" },
  { id: 7,  dim: "anx", rev: false, text: "当伴侣不在身边时，我会担心 TA 会不会对别人产生兴趣。" },
  { id: 8,  dim: "anx", rev: false, text: "当我向伴侣表达感情时，我担心对方对我没有同样的感情。" },
  { id: 9,  dim: "anx", rev: true,  text: "我很少担心伴侣会离开我。" },
  { id: 10, dim: "anx", rev: false, text: "伴侣让我怀疑自己。" },
  { id: 11, dim: "anx", rev: true,  text: "我并不常担心自己会被抛弃。" },
  { id: 12, dim: "anx", rev: false, text: "我发现伴侣不愿意像我希望的那样与我亲近。" },
  { id: 13, dim: "anx", rev: false, text: "有时，伴侣对我的感情似乎会在没有明显原因的情况下发生变化。" },
  { id: 14, dim: "anx", rev: false, text: "我渴望与别人非常亲近，有时这会把对方吓跑。" },
  { id: 15, dim: "anx", rev: false, text: "我害怕伴侣真正了解我之后，就不会喜欢真实的我了。" },
  { id: 16, dim: "anx", rev: false, text: "得不到伴侣给予我所需要的关爱与支持，会让我感到恼火。" },
  { id: 17, dim: "anx", rev: false, text: "我担心自己比不上别人。" },
  { id: 18, dim: "anx", rev: false, text: "似乎只有当我生气时，伴侣才会注意到我。" },

  // ---------- 回避亲密维度 (Avoidance, 18 题) ----------
  { id: 19, dim: "avo", rev: false, text: "我不太愿意让伴侣看到我内心深处的感受。" },
  { id: 20, dim: "avo", rev: true,  text: "和伴侣分享我私人的想法与感受，让我感到自在。" },
  { id: 21, dim: "avo", rev: false, text: "我很难允许自己去依赖伴侣。" },
  { id: 22, dim: "avo", rev: true,  text: "与伴侣亲密相处，让我感到非常自在。" },
  { id: 23, dim: "avo", rev: false, text: "向伴侣敞开心扉，会让我感到不自在。" },
  { id: 24, dim: "avo", rev: false, text: "我不希望自己与伴侣过于亲密。" },
  { id: 25, dim: "avo", rev: false, text: "当伴侣想要非常亲近时，我会感到不舒服。" },
  { id: 26, dim: "avo", rev: true,  text: "对我来说，和伴侣变得亲近相对容易。" },
  { id: 27, dim: "avo", rev: true,  text: "和伴侣亲近，对我来说并不困难。" },
  { id: 28, dim: "avo", rev: true,  text: "我通常会与伴侣讨论自己遇到的问题和烦恼。" },
  { id: 29, dim: "avo", rev: true,  text: "有需要时向伴侣求助，对我很有帮助。" },
  { id: 30, dim: "avo", rev: true,  text: "几乎所有的事，我都会告诉伴侣。" },
  { id: 31, dim: "avo", rev: true,  text: "我会和伴侣商量、讨论事情。" },
  { id: 32, dim: "avo", rev: false, text: "当伴侣与我变得过于亲近时，我会感到紧张。" },
  { id: 33, dim: "avo", rev: true,  text: "依赖伴侣，让我感到自在。" },
  { id: 34, dim: "avo", rev: true,  text: "对我来说，依靠伴侣很容易。" },
  { id: 35, dim: "avo", rev: true,  text: "对伴侣表达爱意，对我来说很容易。" },
  { id: 36, dim: "avo", rev: true,  text: "伴侣真正理解我，也理解我的需求。" },
];
