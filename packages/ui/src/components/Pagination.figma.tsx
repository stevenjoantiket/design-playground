import figma from "@figma/code-connect";

import { Pagination } from "./Pagination.js";

/*
 * `State` is which page you are on, so it comes from `page` — a snippet that said
 * `state="First Page"` next to page 7 would be a lie waiting to happen.
 */
figma.connect(Pagination, "<TDS-2>?node-id=55549-1990", {
  props: {
    disabled: figma.enum("Disabled", { True: true, False: false } as const),
  },
  example: ({ disabled }) => (
    <Pagination page={1} pageCount={20} disabled={disabled} onChange={() => {}} />
  ),
});
