/* Icons for the Instruction page, all from the TDS drop; fills handed to `currentColor` so `Icon` sets the colour. */
import { Icon, type IconColor } from "@tiket-ds/ui";

import arrowRightSvg from "../../../../../../tds library/tds icon/tds_ic_arrow_right.svg?raw";
import backSvg from "../../../../../../tds library/tds icon/tds_ic_back.svg?raw";
import chevronDownSvg from "../../../../../../tds library/tds icon/tds_ic_chevron_down.svg?raw";
import copySvg from "../../../../../../tds library/tds icon/tds_ic_copy.svg?raw";
import informationSvg from "../../../../../../tds library/tds icon/tds_ic_information.svg?raw";
import registerSvg from "../../../../../../tds library/tds icon/tds_ic_register.svg?raw";

const paths = (file: string) =>
  (file.match(/<svg[^>]*>([\s\S]*)<\/svg>/)?.[1] ?? "").replace(/fill="#[0-9A-Fa-f]{3,8}"/g, 'fill="currentColor"');

const GLYPHS = {
  arrowRight: paths(arrowRightSvg),
  back: paths(backSvg),
  chevronDown: paths(chevronDownSvg),
  copy: paths(copySvg),
  information: paths(informationSvg),
  register: paths(registerSvg),
};

export function Glyph({ name, size = 24, color = "highEmphasis" }: { name: keyof typeof GLYPHS; size?: 12 | 16 | 20 | 24 | 32; color?: IconColor }) {
  return (
    <Icon size={size} color={color}>
      <svg viewBox="0 0 24 24" dangerouslySetInnerHTML={{ __html: GLYPHS[name] }} />
    </Icon>
  );
}
