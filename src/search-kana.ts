import kuromoji from "kuromoji";
import type { Listing } from "./types.js";

let tokenizerPromise: Promise<kuromoji.Tokenizer> | null = null;

function getTokenizer(): Promise<kuromoji.Tokenizer> {
  if (!tokenizerPromise) {
    tokenizerPromise = new Promise((resolve, reject) => {
      kuromoji
        .builder({ dicPath: "node_modules/kuromoji/dict" })
        .build((error, tokenizer) => {
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
    .map((token) => token.reading ?? token.surface_form)
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
