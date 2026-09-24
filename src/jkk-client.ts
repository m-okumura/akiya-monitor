import iconv from "iconv-lite";
import * as cheerio from "cheerio";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const BASE = "https://jhomes.to-kousya.or.jp/search/jkknet/service/";
const START_URL = `${BASE}akiyaJyoukenStartInit`;

const SEARCH_SUBMIT_CODE = "E17511BF89D3A101AFEF10EBF1587561";

export class JkkClient {
  private cookies = new Map<string, string>();

  async fetchSearchResults(): Promise<string> {
    await this.get(START_URL);
    const formHtml = await this.post(
      START_URL,
      new URLSearchParams({
        redirect: "true",
        url: START_URL,
      }),
      START_URL,
    );

    const searchFields = this.buildSearchFields(formHtml);
    let resultsHtml = await this.post(
      `${BASE}akiyaJyoukenRef`,
      searchFields,
      START_URL,
    );

    if (this.isApologyPage(resultsHtml)) {
      throw new Error("JKK検索結果の取得に失敗しました（おわびページ）");
    }

    resultsHtml = await this.expandResultPageSize(resultsHtml);
    return resultsHtml;
  }

  private buildSearchFields(formHtml: string): URLSearchParams {
    const $ = cheerio.load(formHtml);
    const token = $('input[name="token"]').attr("value");
    const abcde = $('input[name="abcde"]').attr("value");
    if (!token || !abcde) {
      throw new Error("JKK条件画面の token / abcde を取得できませんでした");
    }

    const params = new URLSearchParams();
    params.set("token", token);
    params.set("abcde", abcde);
    params.set("jklm", SEARCH_SUBMIT_CODE);
    params.set("sen_flg", "1");

    params.append("akiyaInitRM.akiyaRefM.allCheck", "ALLKU");
    params.append("akiyaInitRM.akiyaRefM.allCheck", "ALLSI");

    params.set("akiyaInitRM.akiyaRefM.yachinFrom", "0");
    params.set("akiyaInitRM.akiyaRefM.yachinTo", "999999999");
    params.set("akiyaInitRM.akiyaRefM.mensekiFrom", String(this.mensekiFrom));
    params.set("akiyaInitRM.akiyaRefM.mensekiTo", "9999.99");
    params.set("akiyaInitRM.akiyaRefM.requiredTime", "99");
    params.set("akiyaInitRM.akiyaRefM.bus", "1");
    params.set("akiyaInitRM.akiyaRefM.ensenCd", "");
    params.set("akiyaInitRM.akiyaRefM.jyutakuKanaName", "");

    for (const name of EMPTY_AKIYA_FIELDS) {
      params.set(name, "");
    }

    return params;
  }

  constructor(private readonly mensekiFrom: number) {}

  private async expandResultPageSize(resultsHtml: string): Promise<string> {
    const fields = extractFormFields(resultsHtml, "frmMain");
    fields.set("akiyaRefRM.showCount", "50");
    const expanded = await this.post(
      `${BASE}AKIYAchangeCount`,
      fields,
      `${BASE}akiyaJyoukenRef`,
    );
    if (this.isApologyPage(expanded)) {
      return resultsHtml;
    }
    return expanded;
  }

  private isApologyPage(html: string): boolean {
    return html.includes("owabimoji") || html.includes("おわび");
  }

  private async get(url: string): Promise<string> {
    return this.request(url, { method: "GET" });
  }

  private async post(
    url: string,
    body: URLSearchParams,
    referer: string,
  ): Promise<string> {
    return this.request(url, {
      method: "POST",
      body: this.encodeForm(body),
      referer,
      contentType: "application/x-www-form-urlencoded",
    });
  }

  private encodeForm(params: URLSearchParams): Buffer {
    const encoded = params.toString();
    return iconv.encode(encoded, "Shift_JIS");
  }

  private async request(
    url: string,
    init: {
      method: "GET" | "POST";
      body?: Buffer;
      referer?: string;
      contentType?: string;
    },
  ): Promise<string> {
    const headers: Record<string, string> = {
      "User-Agent": USER_AGENT,
      Accept: "text/html,application/xhtml+xml",
      "Accept-Language": "ja,en;q=0.9",
      Cookie: this.cookieHeader(),
    };
    if (init.referer) headers.Referer = init.referer;
    if (init.contentType) headers["Content-Type"] = init.contentType;

    const response = await fetch(url, {
      method: init.method,
      headers,
      body: init.body ? new Uint8Array(init.body) : undefined,
      redirect: "follow",
    });

    this.storeCookies(response.headers.getSetCookie?.() ?? []);

    const buffer = Buffer.from(await response.arrayBuffer());
    if (!response.ok) {
      throw new Error(`JKK HTTP ${response.status}: ${url}`);
    }
    return iconv.decode(buffer, "Shift_JIS");
  }

  private cookieHeader(): string {
    return [...this.cookies.entries()]
      .map(([k, v]) => `${k}=${v}`)
      .join("; ");
  }

  private storeCookies(setCookieHeaders: string[]): void {
    for (const header of setCookieHeaders) {
      const part = header.split(";")[0];
      const eq = part.indexOf("=");
      if (eq === -1) continue;
      const name = part.slice(0, eq).trim();
      const value = part.slice(eq + 1).trim();
      this.cookies.set(name, value);
    }
  }
}

const EMPTY_AKIYA_FIELDS = [
  "akiyaInitRM.akiyaRefM.muki",
  "akiyaInitRM.akiyaRefM.jtkSbt",
  "akiyaInitRM.akiyaRefM.teishaku",
  "akiyaInitRM.akiyaRefM.renewal",
  "akiyaInitRM.akiyaRefM.fudosan",
  "akiyaInitRM.akiyaRefM.hojinKyk",
  "akiyaInitRM.akiyaRefM.equips",
  "akiyaInitRM.akiyaRefM.checks",
  "akiyaInitRM.akiyaRefM.madoris",
  "akiyaInitRM.akiyaRefM.tanshinFlg",
  "akiyaInitRM.akiyaRefM.teishiKaiFlg",
  "akiyaInitRM.akiyaRefM.yuguFlg",
  "akiyaInitRM.akiyaRefM.ekiCd",
];

export function extractFormFields(
  html: string,
  formName: string,
): URLSearchParams {
  const $ = cheerio.load(html);
  const form = $(`form[name="${formName}"]`);
  const params = new URLSearchParams();

  form.find("input").each((_, el) => {
    const name = $(el).attr("name");
    if (!name) return;
    const type = ($(el).attr("type") ?? "text").toLowerCase();
    if (type === "checkbox" || type === "radio") {
      if ($(el).attr("checked") !== undefined) {
        params.append(name, $(el).attr("value") ?? "on");
      }
      return;
    }
    params.append(name, $(el).attr("value") ?? "");
  });

  form.find("select").each((_, el) => {
    const name = $(el).attr("name");
    if (!name) return;
    const selected =
      $(el).find("option[selected]").attr("value") ??
      $(el).find("option").first().attr("value") ??
      "";
    params.set(name, selected);
  });

  return params;
}
