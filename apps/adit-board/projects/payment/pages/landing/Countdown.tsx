/** Figma's DS-Countdown: red boxes for hh, mm, ss. Shared by the mobile and desktop layouts. */
export function Countdown({ time }: { time: string }) {
  const [h, m, s] = time.split(":");
  return (
    <span className="pay-countdown" aria-label={`Time left ${time}`}>
      <span>{h}</span>:<span>{m}</span>:<span>{s}</span>
    </span>
  );
}
