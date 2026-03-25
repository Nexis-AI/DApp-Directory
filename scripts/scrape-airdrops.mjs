import { createClient } from "@supabase/supabase-js";
import * as cheerio from "cheerio";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing required env vars: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function scrapeAirdrops(url, category) {
  console.log(`[scrape] Fetching ${url}...`);
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml",
    },
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText} for ${url}`);
  }

  const html = await res.text();
  const $ = cheerio.load(html);
  const airdrops = [];

  $("article.airdrop-click").each((_, el) => {
    const wrapper = $(el).find(".inside-article");
    const name = wrapper.find("h3").text().trim();
    const href = wrapper.find("a").first().attr("href") || "";
    const logoUrl =
      wrapper.find(".air-thumbnail img").attr("data-src") ||
      wrapper.find(".air-thumbnail img").attr("src") ||
      "";
    const rewards = wrapper.find(".est-value span").text().trim();

    if (name && href) {
      airdrops.push({
        name,
        url: href.startsWith("http") ? href : `https://airdrops.io${href}`,
        logo_url: logoUrl,
        rewards,
        chain: "Unknown",
        category: category ?? "Airdrop",
        updated_at: new Date().toISOString(),
      });
    }
  });

  return airdrops;
}

async function run() {
  const pages = [
    { url: "https://airdrops.io/latest/", category: "Airdrop" },
    { url: "https://airdrops.io/hot/", category: "Airdrop" },
    { url: "https://airdrops.io/speculative/", category: "DeFi Retroactive" },
  ];

  const allAirdrops = [];

  for (const page of pages) {
    try {
      const airdrops = await scrapeAirdrops(page.url, page.category);
      console.log(`[scrape] Found ${airdrops.length} airdrops from ${page.url}`);
      allAirdrops.push(...airdrops);
      // Respectful delay between requests
      await new Promise((r) => setTimeout(r, 1500));
    } catch (err) {
      console.error(`[scrape] Error on ${page.url}:`, err.message);
    }
  }

  // De-duplicate by name
  const seen = new Set();
  const unique = allAirdrops.filter((a) => {
    if (seen.has(a.name)) return false;
    seen.add(a.name);
    return true;
  });

  console.log(`[scrape] Total unique airdrops: ${unique.length}`);

  if (unique.length === 0) {
    console.log("[scrape] Nothing to insert. Exiting.");
    return;
  }

  const { data, error } = await supabase
    .from("airdrops")
    .upsert(unique, { onConflict: "name" })
    .select("id, name");

  if (error) {
    console.error("[scrape] Upsert error:", error.message);
    process.exit(1);
  }

  console.log(`[scrape] ✅ Upserted ${data.length} airdrops successfully.`);
  data.slice(0, 10).forEach((r) => console.log(`   - ${r.name}`));
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
