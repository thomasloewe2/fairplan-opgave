import { Link } from "react-router";
import { PageHeader } from "../components/UI";
import { AppIcon, type AppIconName } from "../components/AppIcon";
import { useResource } from "../hooks/useResource";
import { api } from "../services/apiService";

export default function Home() {
  const periods = useResource(api.periods.list, []);
  const sections = useResource(api.sections.list, []);
  const users = useResource(api.users.list, []);
  const employments = useResource(api.employments.list, []);

  const cards: { label: string; value: number | string; to: string; icon: AppIconName }[] = [
    { label: "Planlægningsperioder", value: periods.loading ? "…" : periods.data.length, to: "/perioder", icon: "calendar" },
    { label: "Afsnit", value: sections.loading ? "…" : sections.data.length, to: "/organisering", icon: "building" },
    { label: "Brugere", value: users.loading ? "…" : users.data.length, to: "/adgangsstyring/brugere", icon: "shield" },
    { label: "Ansættelser", value: employments.loading ? "…" : employments.data.length, to: "/adgangsstyring/ansaettelser", icon: "briefcase" },
  ];
  return <>
    <PageHeader title="Overblik" description="Velkommen til administration af perioder, organisation og personale." />
    <div className="stats-grid">
      {cards.map(card => <Link to={card.to} className="stat-card" key={card.label}>
        <span className="stat-head">
          <span className="stat-label">{card.label}</span>
          <span className="stat-icon"><AppIcon name={card.icon} size={18} /></span>
        </span>
        <strong className="stat-number">{card.value}</strong>
        <span className="stat-link">Se oversigt <AppIcon name="arrow-up-right" size={15} /></span>
      </Link>)}
    </div>
    <div className="home-panels">
      <section className="panel intro-panel">
        <h2>Administrér vagtplansgrundlaget</h2>
        <p>Opret perioder, organisér afsnit og personalegrupper, og knyt brugere til ansættelser. Personaleoversigten viser ansættelser for den valgte planlægningsperiode.</p>
        <Link className="btn btn-primary" to="/personale">Åbn personaleoversigt <AppIcon name="arrow-up-right" size={16} /></Link>
      </section>
      <section className="panel">
        <h2>Hurtige genveje</h2>
        <div className="quick-links">
          <Link to="/perioder"><span className="quick-link-main"><AppIcon name="calendar" size={18} />Administrer perioder</span><AppIcon name="chevron-right" size={17} className="quick-link-arrow" /></Link>
          <Link to="/organisering"><span className="quick-link-main"><AppIcon name="building" size={18} />Organisering</span><AppIcon name="chevron-right" size={17} className="quick-link-arrow" /></Link>
          <Link to="/adgangsstyring/brugere"><span className="quick-link-main"><AppIcon name="shield" size={18} />Adgangsstyring</span><AppIcon name="chevron-right" size={17} className="quick-link-arrow" /></Link>
          <Link to="/adgangsstyring/ansaettelser"><span className="quick-link-main"><AppIcon name="briefcase" size={18} />Ansættelser</span><AppIcon name="chevron-right" size={17} className="quick-link-arrow" /></Link>
        </div>
      </section>
    </div>
  </>;
}
