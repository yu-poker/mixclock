/* ===== サイト共通設定（ここだけ書き換えればOK） ===== */
const SITE = {
  name: "Mix Clock 10",
  // 投げ銭ページのURL（OFUSE / Ko-fi など）。空ならボタンは出ません
  tipUrl: "",
  tipLabel: "☕ 開発を応援する（投げ銭）",
  // お問い合わせ先（Googleフォームや X のURLなど）。空なら「準備中」と表示
  contactUrl: "",
  contactLabel: "お問い合わせフォーム",
  // BOOTHの商品ページ
  boothUrl: "https://yupoker.booth.pm/items/9135566",
  boothLabel: "📄 印刷用 10ゲーム早見表＋ルールカード（BOOTH・500円）",
};
/* ================================================= */

(function () {
  const f = document.getElementById("sitefoot");
  if (!f) return;
  const tip = SITE.tipUrl
    ? `<a class="tipbtn" href="${SITE.tipUrl}" target="_blank" rel="noopener">${SITE.tipLabel}</a>`
    : "";
  const booth = SITE.boothUrl
    ? `<a class="boothbtn" href="${SITE.boothUrl}" target="_blank" rel="noopener">${SITE.boothLabel}</a>`
    : "";
  f.innerHTML = `${booth}${tip}
  <nav class="footnav">
    <a href="index.html">タイマー</a>
    <a href="howto.html">使い方</a>
    <a href="rules.html">10ゲームのルール</a>
    <a href="quiz.html">ロー判定クイズ</a>
    <a href="about.html">運営者情報・お問い合わせ</a>
    <a href="privacy.html">プライバシーポリシー</a>
  </nav>
  <p class="copy">© ${new Date().getFullYear()} ${SITE.name}</p>`;
  const c = document.getElementById("contact");
  if (c)
    c.innerHTML = SITE.contactUrl
      ? `<a href="${SITE.contactUrl}" target="_blank" rel="noopener">${SITE.contactLabel}</a>`
      : "準備中です。";
})();
