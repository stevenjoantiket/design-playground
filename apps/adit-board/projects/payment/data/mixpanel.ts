import type { MixpanelSnapshot } from "../../../shared/MixpanelPage.js";
import snapshot from "./mixpanel-cases.json";

export const MIXPANEL = snapshot as MixpanelSnapshot;

/** What "Sync from Mixpanel" asks Claude Code to do: rerun the queries behind the snapshot. */
export const MIXPANEL_SYNC_BRIEF = `# Refresh the payment Mixpanel snapshot

Rewrite \`apps/adit-board/projects/payment/data/mixpanel-cases.json\` with fresh numbers, keeping its shape exactly.

Use the Mixpanel MCP tools on project 3965186 (tiket.com Production). Call Get-Business-Context first.
Date range: the 12 months ending yesterday (absolute dates). Set \`from\` and \`to\` to them, and
\`syncedAt\` to now (ISO, with the +07:00 offset).

1. Payers: Run-Query insights, continuePayment, unique users, chartType bar, breakdown userType.
   \`payers\` is the total; \`cases.returning.users\` is the "Existing" row; \`cases.new.users\` is payers minus returning.
2. Savings: Run-Query funnels continueWithPromo → continuePayment, and continueWithTiketPoints → continuePayment.
   \`cases.savings.users\` is the promo funnel's second step; mention both counts in \`cases.savings.how\`.
3. Monthly: Run-Query insights, unit month, chartType line: continuePayment unique broken down by userType,
   and continuePayment, continueWithPromo, continueWithTiketPoints unique. Fill \`monthly.rows\`
   (month as YYYY-MM, payers, returning, promo, points) and \`monthly.reports\` with the report URLs.

Write each \`summary\` as now ("34% of payers", "18% promo · 11% points"), rounded to whole percent, and
each \`report\` with the URL the query returned. Do not change any other file. Then run \`pnpm verify\`.
`;
