import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";
import * as cheerio from "https://esm.sh/cheerio@1.0.0-rc.12";

// Initialize the Supabase Client
const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const supabase = createClient(supabaseUrl, supabaseKey);

Deno.serve(async (req) => {
  try {
    const url = "https://airdrops.io/latest/";
    console.log(`Fetching latest airdrops from ${url}...`);
    
    // Fetch the html
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!res.ok) {
      throw new Error(`Failed to fetch airdrops.io: ${res.statusText}`);
    }
    const html = await res.text();
    const $ = cheerio.load(html);

    const airdrops: any[] = [];

    $("article.airdrop-click").each((idx, el) => {
      const wrapper = $(el).find(".inside-article");
      const name = wrapper.find("h3").text().trim();
      const airdropUrl = wrapper.find("a").first().attr("href") || "";
      let logoUrl = wrapper.find(".air-thumbnail img").attr("data-src") || wrapper.find(".air-thumbnail img").attr("src") || "";
      const rewards = wrapper.find(".est-value span").text().trim();
      const blockchain = "Unknown"; // Often not strictly populated on the card
      
      if (name && airdropUrl) {
        airdrops.push({
          name,
          url: airdropUrl.startsWith("http") ? airdropUrl : `https://airdrops.io${airdropUrl}`,
          logo_url: logoUrl,
          rewards,
          chain: blockchain,
          category: "Airdrop",
          updated_at: new Date().toISOString()
        });
      }
    });

    console.log(`Found ${airdrops.length} airdrops to index.`);

    // Upsert into Supabase (in batches to avoid timeout constraints if too large)
    for (const item of airdrops) {
      const { error } = await supabase
        .from("airdrops")
        .upsert(
          {
            name: item.name,
            url: item.url,
            logo_url: item.logo_url,
            rewards: item.rewards,
            chain: item.chain,
            category: item.category,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "name" }
        );

      if (error) {
        console.error(`Error saving airdrop ${item.name}:`, error.message);
      }
    }

    return new Response(JSON.stringify({ success: true, count: airdrops.length }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("Scraper Error:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
