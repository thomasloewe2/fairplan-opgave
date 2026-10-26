import { Link } from "react-router";
import { PageHeader } from "../components/UI";
import { useResource } from "../hooks/useResource";
import { api } from "../services/apiService";

export default function Home() {
  const periods = useResource(api.periods.list, []);
  const sections = useResource(api.sections.list, []);
  const users = useResource(api.users.list, []);
  const employments = useResource(api.employments.list, []);

  const cards = [
    { label: "Planlægningsperioder", value: periods.loading ? "…" : periods.data.length, to: "/perioder" },
    { label: "Afsnit", value: sections.loading ? "…" : sections.data.length, to: "/organisering" },
    { label: "Brugere", value: users.loading ? "…" : users.data.length, to: "/adgangsstyring/brugere" },
    { label: "Ansættelser", value: employments.loading ? "…" : employments.data.length, to: "/adgangsstyring/ansaettelser" },
  ];
  return <>
    <PageHeader title="Overblik" description="Velkommen til administration af perioder, organisation og personale." />
    <div className="stats-grid">
      {cards.map(card => <Link to={card.to} className="stat-card" key={card.label}>
        <span className="stat-label">{card.label}</span><strong className="stat-number">{card.value}</strong>
        <span className="stat-link">Se oversigt →</span>
      </Link>)}
    </div>
    <div className="home-panels">
      <section className="panel intro-panel">
        <h2>Administrér vagtplansgrundlaget</h2>
        <p>Opret perioder, organisér afsnit og personalegrupper, og knyt brugere til ansættelser. Personaleoversigten viser ansættelser for den valgte planlægningsperiode.</p>
        <Link className="btn btn-primary" to="/personale">Åbn personaleoversigt →</Link>
      </section>
      <section className="panel">
        <h2>Hurtige genveje</h2>
        <div className="quick-links">
          <Link to="/perioder">Administrer perioder <span>→</span></Link>
          <Link to="/organisering">Organisering <span>→</span></Link>
          <Link to="/adgangsstyring/brugere">Adgangsstyring <span>→</span></Link>
          <Link to="/adgangsstyring/ansaettelser">Ansættelser <span>→</span></Link>
        </div>
      </section>
    </div>
  </>;
}
