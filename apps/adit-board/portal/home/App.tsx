import { Icon } from "../../shared/portal.js";
import { PROJECTS } from "../../shared/projects.js";

export function App() {
  return (
    <main className="board portal">
      <div className="board__main">
        <header className="p-stack">
          <h1 className="p-h1">Krakatoa's board</h1>
          <p className="p-muted">Prototypes, experiments and the design system they're built from.</p>
        </header>
        <nav aria-label="Projects">
          <ul className="board__list">
            {PROJECTS.map((link) => (
              <li key={link.path}>
                <a className="board__link" href={`${import.meta.env.BASE_URL}${link.path}`}>
                  <span className="p-stack">
                    <span className="p-strong">{link.title}</span>
                    <span className="p-sm p-muted">{link.note}</span>
                  </span>
                  <Icon name="chevronRight" size={18} />
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </main>
  );
}
