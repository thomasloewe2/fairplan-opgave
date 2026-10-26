import { useCallback, useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "../components/DataTable";
import { Loading, Notice, PageHeader } from "../components/UI";
import { useResource } from "../hooks/useResource";
import { api, type PersonnelRow } from "../services/apiService";
import { formatPeriod } from "../utils/display";

export default function Personnel() {
  const periods = useResource(api.periods.list, []);
  const [periodId, setPeriodId] = useState("");
  useEffect(() => {
    // Preserve the current selection on reload, but fall back if that period was deleted.
    if (!periods.loading && !periods.error) {
      setPeriodId(current => periods.data.some(p => p.id === current)
        ? current : periods.data[0]?.id ?? "");
    }
  }, [periods.data, periods.loading, periods.error]);

  const loadPersonnel = useCallback(
    () => periodId ? api.personnel(periodId) : Promise.resolve([] as PersonnelRow[]),
    [periodId],
  );
  const personnel = useResource(loadPersonnel, []);
  const columns = useMemo<ColumnDef<PersonnelRow>[]>(() => [
    { accessorKey: "fullName", header: "Navn" },
    { accessorKey: "sectionName", header: "Afsnit" },
    { accessorKey: "staffGroupName", header: "Personalegruppe" },
    { accessorKey: "hoursPerWeek", header: "Timer/uge",
      cell: ({ row }) => `${row.original.hoursPerWeek} timer` },
  ], []);

  const sections = [...new Set(personnel.data.map(p => p.sectionName))].sort();
  const groups = [...new Set(personnel.data.map(p => p.staffGroupName))].sort();

  return <>
    <PageHeader title="Personale" description="Oversigt over ansættelser, der overlapper den valgte planlægningsperiode." />
    <section className="panel">
      <div className="period-select-row">
        <label className="field"><span>Vælg planlægningsperiode</span>
          <select value={periodId} onChange={e => setPeriodId(e.target.value)} disabled={periods.loading || !!periods.error}>
            {!periods.data.length && <option value="">Ingen perioder</option>}
            {periods.data.map(p => <option key={p.id} value={p.id}>{p.name} ({formatPeriod(p.startDate, p.endDate)})</option>)}
          </select>
        </label>
        <span className="readonly-label">Skrivebeskyttet oversigt</span>
      </div>
      <Notice message={periods.error || personnel.error} />
      {(periods.loading || personnel.loading) ? <Loading /> :
        <DataTable data={periodId ? personnel.data : []} columns={columns}
          searchPlaceholder="Søg efter navn, afsnit eller personalegruppe…"
          emptyText={periodId ? "Ingen ansættelser overlapper den valgte periode." : "Opret en periode for at se personale."}
          filters={[
            { columnId: "sectionName", label: "Afsnit", options: sections.map(s => ({ value: s, label: s })) },
            { columnId: "staffGroupName", label: "Personalegruppe", options: groups.map(g => ({ value: g, label: g })) },
          ]} />}
    </section>
  </>;
}
