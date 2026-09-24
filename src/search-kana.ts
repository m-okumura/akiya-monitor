import kuromoji from "kuromoji";
import type { Listing } from "./types.js";

type JkkTokenizer = kuromoji.Tokenizer<kuromoji.IpadicFeatures>;

let tokenizerPromise: Promise<JkkTokenizer> | null = null;

function getTokenizer(): Promise<JkkTokenizer> {
  if (!tokenizerPromise) {
    tokenizerPromise = new Promise((resolve, reject) => {
      kuromoji
        .builder({ dicPath: "node_modules/kuromoji/dict" })
        .build((error: Error | null, tokenizer: JkkTokenizer) => {
          if (error) reject(error);
          else resolve(tokenizer);
        });
    });
  }
  return tokenizerPromise;
}

/** JKK「住宅名(カナ)」欄用の全角カタカナ（部分検索可） */
export async function toJkkSearchKana(name: string): Promise<string> {
  const tokenizer = await getTokenizer();
  const tokens = tokenizer.tokenize(name.trim());
  const kana = tokens
    .map((token: kuromoji.IpadicFeatures) => token.reading ?? token.surface_form)
    .join("");
  return kana || name;
}

export async function enrichListingsWithSearchKana(
  listings: Listing[],
): Promise<Listing[]> {
  return Promise.all(
    listings.map(async (listing) => ({
      ...listing,
      searchKana: await toJkkSearchKana(listing.name),
    })),
  );
}
