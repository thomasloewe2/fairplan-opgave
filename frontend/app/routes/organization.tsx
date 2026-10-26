import { useMemo, useState, type SubmitEvent } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "../components/DataTable";
import { Button, ColorField, ConfirmDialog, Dialog, Loading, Notice, PageHeader } from "../components/UI";
import { useCrud } from "../hooks/useCrud";
import { api, type Section, type SectionInput, type StaffGroup, type StaffGroupInput } from "../services/apiService";

function SectionForm({ initial, busy, error, cancel, save }: {
  initial: SectionInput; busy: boolean; error: string | null;
  cancel: () => void; save: (value: SectionInput) => Promise<void>;
}) {
  const [value, setValue] = useState(initial);
  const validColor = /^#[0-9a-f]{6}$/i.test(value.colorHex);
  return <form onSubmit={(e: SubmitEvent<HTMLFormElement>) => { e.preventDefault(); if (validColor) void save(value); }}>
    <label className="field"><span>Afsnitsnavn</span>
      <input required maxLength={100} placeholder="F.eks. Akutafsnit" value={value.name}
        onChange={e => setValue({ ...value, name: e.target.value })} />
    </label>
    <div className="field">
      <span>Farve</span>
      <ColorField value={value.colorHex} onChange={colorHex => setValue({ ...value, colorHex })} />
      <small className="muted">Vælg en farve eller indtast en præcis HEX-kode, fx #000000.</small>
    </div>
    {!validColor && <Notice message="Indtast en farve på formatet #RRGGBB." />}
    <Notice message={error} />
    <div className="dialog-actions">
      <Button type="button" variant="secondary" onClick={cancel}>Annuller</Button>
      <Button type="submit" disabled={busy || !validColor}>{busy ? "Gemmer…" : "Gem afsnit"}</Button>
    </div>
  </form>;
}
function GroupForm({ initial, busy, error, cancel, save }: {
  initial: StaffGroupInput; busy: boolean; error: string | null;
  cancel: () => void; save: (value: StaffGroupInput) => Promise<void>;
}) {
  const [value, setValue] = useState(initial);
  return <form onSubmit={(e: SubmitEvent<HTMLFormElement>) => { e.preventDefault(); void save(value); }}>
    <label className="field"><span>Navn på personalegruppe</span>
      <input required maxLength={100} placeholder="F.eks. Læger" value={value.name}
        onChange={e => setValue({ name: e.target.value })} />
    </label>
    <Notice message={error} />
    <div className="dialog-actions">
      <Button type="button" variant="secondary" onClick={cancel}>Annuller</Button>
      <Button type="submit" disabled={busy}>{busy ? "Gemmer…" : "Gem personalegruppe"}</Button>
    </div>
  </form>;
}

export default function Organization() {
  const sections = useCrud(api.sections);
  const groups = useCrud(api.staffGroups);
  const [sectionKey, setSectionKey] = useState(0);
  const [groupKey, setGroupKey] = useState(0);
  const openSection = (value?: Section) => {
    setSectionKey(x => x + 1);
    if (value) sections.edit(value); else sections.create();
  };
  const openGroup = (value?: StaffGroup) => {
    setGroupKey(x => x + 1);
    if (value) groups.edit(value); else groups.create();
  };
  const sectionCols = useMemo<ColumnDef<Section>[]>(() => [
    { accessorKey: "name", header: "Afsnit" },
    { accessorKey: "colorHex", header: "Farve", filterFn: "equalsString",
      cell: ({ row }) => <span className="color-value">
      <span className="color-dot" style={{ backgroundColor: row.original.colorHex }} />
      <span className="code-value">{row.original.colorHex}</span>
    </span> },
    { id: "actions", header: "Handlinger", enableSorting: false, enableGlobalFilter: false,
      cell: ({ row }) => <div className="row-actions">
        <button type="button" onClick={() => openSection(row.original)}>Rediger</button>
        <button type="button" className="danger-link" onClick={() => sections.askDelete(row.original)}>Slet</button>
      </div> },
  ], []);
  const groupCols = useMemo<ColumnDef<StaffGroup>[]>(() => [
    { accessorKey: "name", header: "Personalegruppe", filterFn: "equalsString" },
    { id: "actions", header: "Handlinger", enableSorting: false, enableGlobalFilter: false,
      cell: ({ row }) => <div className="row-actions">
        <button type="button" onClick={() => openGroup(row.original)}>Rediger</button>
        <button type="button" className="danger-link" onClick={() => groups.askDelete(row.original)}>Slet</button>
      </div> },
  ], []);

  const colorOptions = useMemo(() =>
    [...new Set(sections.data.map(section => section.colorHex.toUpperCase()))]
      .sort().map(color => ({ value: color, label: color })),
    [sections.data],
  );
  const groupOptions = useMemo(() =>
    [...new Set(groups.data.map(group => group.name))]
      .sort((a, b) => a.localeCompare(b, "da"))
      .map(name => ({ value: name, label: name })),
    [groups.data],
  );

  return <>
    <PageHeader title="Organisering" description="Administrer afsnit og personalegrupper." />
    <div className="organization-grid">
      <section className="panel">
        <div className="panel-heading"><div><h2>Afsnit</h2><p className="muted">Afsnit og deres farvekoder</p></div>
          <Button onClick={() => openSection()}>+ Opret afsnit</Button></div>
        <Notice message={sections.error} /><Notice kind="success" message={sections.message} />
        {sections.loading && !sections.data.length ? <Loading /> :
          <DataTable columns={sectionCols} data={sections.data} searchPlaceholder="Søg efter afsnit…"
            filters={[{ columnId: "colorHex", label: "Farve", options: colorOptions }]} />}
      </section>
      <section className="panel">
        <div className="panel-heading"><div><h2>Personalegrupper</h2><p className="muted">Faglige personalegrupper</p></div>
          <Button onClick={() => openGroup()}>+ Opret gruppe</Button></div>
        <Notice message={groups.error} /><Notice kind="success" message={groups.message} />
        {groups.loading && !groups.data.length ? <Loading /> :
          <DataTable columns={groupCols} data={groups.data} searchPlaceholder="Søg efter gruppe…"
            filters={[{ columnId: "name", label: "Personalegruppe", options: groupOptions }]} />}
      </section>
    </div>
    {sections.editing && <Dialog title={sections.editing === "new" ? "Opret afsnit" : "Rediger afsnit"} onClose={sections.closeEdit}>
      <SectionForm key={sectionKey} initial={sections.editing === "new"
        ? { name: "", colorHex: "#2563EB" }
        : { name: sections.editing.name, colorHex: sections.editing.colorHex }}
        busy={sections.busy} error={sections.mutationError} cancel={sections.closeEdit} save={sections.save} />
    </Dialog>}
    {groups.editing && <Dialog title={groups.editing === "new" ? "Opret personalegruppe" : "Rediger personalegruppe"} onClose={groups.closeEdit}>
      <GroupForm key={groupKey} initial={groups.editing === "new" ? { name: "" } : { name: groups.editing.name }}
        busy={groups.busy} error={groups.mutationError} cancel={groups.closeEdit} save={groups.save} />
    </Dialog>}
    {sections.deleting && <ConfirmDialog subject={sections.deleting.name} error={sections.mutationError}
      busy={sections.busy} onCancel={sections.closeDelete} onConfirm={() => void sections.remove()} />}
    {groups.deleting && <ConfirmDialog subject={groups.deleting.name} error={groups.mutationError}
      busy={groups.busy} onCancel={groups.closeDelete} onConfirm={() => void groups.remove()} />}
  </>;
}
