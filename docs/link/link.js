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

function readBuildingName() {
  const params = new URLSearchParams(window.location.search);
  const q = params.get("q");
  if (q) return q;
  return decodeLegacyBase64Url(params.get("n"));
}

function copyText(text) {
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text);
  }
  return new Promise((resolve, reject) => {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    try {
      const ok = document.execCommand("copy");
      document.body.removeChild(textarea);
      if (ok) resolve();
      else reject(new Error("copy failed"));
    } catch (error) {
      document.body.removeChild(textarea);
      reject(error);
    }
  });
}

function init() {
  const name = readBuildingName().trim();
  const nameEl = document.getElementById("building-name");
  const copyBtn = document.getElementById("copy-name");
  const statusEl = document.getElementById("copy-status");

  if (!nameEl || !copyBtn || !statusEl) return;

  nameEl.textContent = name || "（建物名がありません。メール内の表記をコピーしてください）";
  copyBtn.disabled = !name;

  copyBtn.addEventListener("click", () => {
    if (!name) {
      statusEl.textContent = "コピーする建物名がありません";
      return;
    }
    copyText(name)
      .then(() => {
        statusEl.textContent = "住宅名をコピーしました";
      })
      .catch(() => {
        statusEl.textContent =
          "自動コピーできませんでした。上の建物名を長押し／ドラッグで選択してコピーしてください";
      });
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
