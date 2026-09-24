import path from "node:path";
import { config } from "./config.js";
import { createNotifier, isNotifierConfigured } from "./notify/index.js";
import { applyOptionalFilters } from "./filter.js";
import { JkkClient } from "./jkk-client.js";
import { parseListings, parseResultCount } from "./parse-listings.js";
import { enrichListingsWithSearchKana } from "./search-kana.js";
import { diffListingIds, loadState, saveState } from "./state.js";

async function main(): Promise<void> {
  const statePath = path.resolve(process.cwd(), config.statePath);
  const client = new JkkClient(config.mensekiMin);
  const notifier = createNotifier();

  console.log("JKK空き家監視を開始します…");
  const html = await client.fetchSearchResults();
  const totalCount = parseResultCount(html) ?? 0;
  let listings = parseListings(html);
  listings = applyOptionalFilters(listings, {
    mensekiMin: config.mensekiMin,
    yachinMax: config.yachinMax,
  });
  listings = await enrichListingsWithSearchKana(listings);

  console.log(`該当 ${totalCount} 件 / パース ${listings.length} 件`);

  const currentIds = listings.map((l) => l.id);

  if (config.snapshotEmail) {
    console.log(
      `スナップショット: ${listings.length} 件をメール送信します（${config.notifyProvider}）`,
    );
    await notifier.sendSnapshot(listings, totalCount);
    await saveState(statePath, currentIds);
    return;
  }
  const previous = await loadState(statePath);
  const previousIds = new Set(previous?.listingIds ?? []);
  const isFirstRun = previous === null;

  await saveState(statePath, currentIds);

  const newIds = diffListingIds(previousIds, currentIds);
  const newListings = listings.filter((l) => newIds.includes(l.id));

  if (isFirstRun && !config.notifyOnFirstRun) {
    console.log(
      `初回実行のため通知をスキップしました（保存 ID: ${currentIds.length} 件）`,
    );
    return;
  }

  if (newListings.length === 0) {
    console.log("新規物件はありません");
    return;
  }

  console.log(
    `新規 ${newListings.length} 件をメール送信します（${config.notifyProvider}）`,
  );
  await notifier.sendNewListings(newListings, totalCount);
}

main().catch(async (error) => {
  const message = error instanceof Error ? error.stack ?? error.message : String(error);
  console.error(message);
  try {
    if (isNotifierConfigured()) {
      await createNotifier().sendFailure(message);
    }
  } catch (mailError) {
    console.error("失敗通知メールも送信できませんでした:", mailError);
  }
  process.exit(1);
});
