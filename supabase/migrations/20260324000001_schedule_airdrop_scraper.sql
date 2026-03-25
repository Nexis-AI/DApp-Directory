-- Schedule the Edge Function to run every 7 days (Sundays at midnight)
SELECT cron.schedule(
    'weekly-airdrop-scraper',
    '0 0 * * 0',
    $$
    SELECT net.http_post(
        url:='https://<project-ref>.supabase.co/functions/v1/weekly-airdrop-scraper',
        headers:='{"Authorization": "Bearer <SERVICE_ROLE_KEY>"}'::jsonb
    );
    $$
);
