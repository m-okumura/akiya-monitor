function decodeLegacyBase64Url(param) {
  if (!param) return "";
  try {
    const b64 = param.replace(/-/g, "+").replace(/_/g, "/");
    const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch {
    return "";
  }
}

function hasKanji(text) {
  return /[\u4e00-\u9faf]/.test(text);
}

function readParams() {
  const params = new URLSearchParams(window.location.search);
  const q = params.get("q");
  const displayName = (q || decodeLegacyBase64Url(params.get("n"))).trim();
  const kParam = (params.get("k") || "").trim();
  let searchKana = kParam;
  if (!searchKana && displayName && !hasKanji(displayName)) {
    searchKana = displayName;
  }
  if (searchKana && hasKanji(searchKana)) {
    searchKana = "";
  }
  return { displayName, searchKana };
}

function copyText(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text);
  }
  return new Promise(function (resolve, reject) {
    var textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    try {
      var ok = document.execCommand("copy");
      document.body.removeChild(textarea);
      if (ok) resolve();
      else reject(new Error("copy failed"));
    } catch (error) {
      document.body.removeChild(textarea);
      reject(error);
    }
  });
}

function initLinkPage() {
  var parsed = readParams();
  var displayName = parsed.displayName;
  var searchKana = parsed.searchKana;
  var nameEl = document.getElementById("building-name");
  var kanaEl = document.getElementById("building-kana");
  var kanaCopyEl = document.getElementById("building-kana-copy");
  var copyBtn = document.getElementById("copy-name");
  var statusEl = document.getElementById("copy-status");

  if (!nameEl || !kanaEl || !copyBtn || !statusEl) return;

  nameEl.textContent =
    displayName || "（建物名がありません。メール内の表記を確認してください）";

  if (searchKana) {
    kanaEl.textContent = "住宅名（カナ）";
    if (kanaCopyEl) {
      kanaCopyEl.textContent = searchKana;
      kanaCopyEl.hidden = false;
    }
    copyBtn.disabled = false;
  } else {
    kanaEl.textContent =
      "住宅名（カナ）がリンクに含まれていません。新しい通知メールのリンクを開くか、下のカナ行を手入力してください。";
    if (kanaCopyEl) {
      kanaCopyEl.textContent = "";
      kanaCopyEl.hidden = true;
    }
    copyBtn.disabled = true;
  }

  copyBtn.addEventListener("click", function () {
    if (!searchKana) {
      statusEl.textContent = "コピーできるカナがありません";
      return;
    }
    copyText(searchKana)
      .then(function () {
        statusEl.textContent = "住宅名（カナ）をコピーしました";
      })
      .catch(function () {
        statusEl.textContent =
          "自動コピーできませんでした。青いカナの文字を長押し／ドラッグで選択してコピーしてください";
      });
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initLinkPage);
} else {
  initLinkPage();
}
