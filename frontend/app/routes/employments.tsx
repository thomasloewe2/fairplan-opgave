import { useMemo, useState, type SubmitEvent } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router";
import { DataTable } from "../components/DataTable";
import { Button, ConfirmDialog, Dialog, Loading, Notice, PageHeader } from "../components/UI";
import { useCrud } from "../hooks/useCrud";
import { useResource } from "../hooks/useResource";
import {
  api, type Employment, type EmploymentInput, type Section, type StaffGroup, type User,
} from "../services/apiService";
import { formatDate } from "../utils/display";

function EmploymentForm({ initial, busy, error, cancel, save, users, sections, groups }: {
  initial: EmploymentInput; busy: boolean; error: string | null;
  cancel: () => void; save: (value: EmploymentInput) => Promise<void>;
  users: User[]; sections: Section[]; groups: StaffGroup[];
}) {
  const [value, setValue] = useState<EmploymentInput>(initial);
  const datesInvalid = !!value.startDate && !!value.endDate && value.startDate >= value.endDate;
  const hasOptions = users.some(u => u.isPersonnel) && sections.length > 0 && groups.length > 0;
  return <form onSubmit={(e: SubmitEvent<HTMLFormElement>) => { e.preventDefault(); if (!datesInvalid && value.startDate && value.endDate) void save(value); }}>
    {!hasOptions && <Notice kind="info" message="Opret først en bruger med Personale-rollen, et afsnit og en personalegruppe." />}
    <label className="field"><span>Bruger</span>
      <select required value={value.userId} onChange={e => setValue({ ...value, userId: e.target.value })}>
        <option value="">Vælg bruger</option>
        {users.filter(u => u.isPersonnel).map(u => <option key={u.id} value={u.id}>{u.fullName} ({u.email})</option>)}
      </select>
    </label>
    <div className="form-grid">
      <label className="field"><span>Afsnit</span>
        <select required value={value.sectionId} onChange={e => setValue({ ...value, sectionId: e.target.value })}>
          <option value="">Vælg afsnit</option>
          {sections.map(section => <option key={section.id} value={section.id}>{section.name}</option>)}
        </select>
      </label>
      <label className="field"><span>Personalegruppe</span>
        <select required value={value.staffGroupId} onChange={e => setValue({ ...value, staffGroupId: e.target.value })}>
          <option value="">Vælg personalegruppe</option>
          {groups.map(group => <option key={group.id} value={group.id}>{group.name}</option>)}
        </select>
      </label>
    </div>
    <label className="field"><span>Timer pr. uge</span>
      <input type="number" required min={0} max={37} step={1} value={value.hoursPerWeek}
        onChange={e => setValue({ ...value, hoursPerWeek: Number(e.target.value) })} />
    </label>
    <div className="form-grid">
      <label className="field"><span>Startdato</span>
        <input type="date" required value={value.startDate}
          onChange={e => setValue(v => ({ ...v, startDate: e.target.value }))} />
      </label>
      <label className="field"><span>Slutdato</span>
        <input type="date" required value={value.endDate}
          onChange={e => setValue(v => ({ ...v, endDate: e.target.value }))} />
      </label>
    </div>
    {datesInvalid && <Notice message="Slutdato skal ligge efter startdato." />}
    <Notice message={error} />
    <div className="dialog-actions">
      <Button type="button" variant="secondary" onClick={cancel}>Annuller</Button>
      <Button type="submit" disabled={busy || datesInvalid || !hasOptions || !value.startDate || !value.endDate}>{busy ? "Gemmer…" : "Gem ansættelse"}</Button>
    </div>
  </form>;
}

type EmploymentTableRow = Employment & { userName: string; sectionName: string; groupName: string };

export default function Employments() {
  const crud = useCrud(api.employments);
  const users = useResource(api.users.list, []);
  const sections = useResource(api.sections.list, []);
  const groups = useResource(api.staffGroups.list, []);
  const [formKey, setFormKey] = useState(0);
  const userName = (id: string) => users.data.find(u => u.id === id)?.fullName ?? "Ukendt bruger";
  const sectionName = (id: string) => sections.data.find(s => s.id === id)?.name ?? "Ukendt afsnit";
  const groupName = (id: string) => groups.data.find(g => g.id === id)?.name ?? "Ukendt gruppe";

  // Resolve related labels into table data. TanStack caches accessor values per row;
  // accessor functions closing over initially-empty lookups would otherwise stay "Ukendt".
  const rows = useMemo<EmploymentTableRow[]>(() => crud.data.map(employment => ({
    ...employment,
    userName: users.data.find(user => user.id === employment.userId)?.fullName ?? "Ukendt bruger",
    sectionName: sections.data.find(section => section.id === employment.sectionId)?.name ?? "Ukendt afsnit",
    groupName: groups.data.find(group => group.id === employment.staffGroupId)?.name ?? "Ukendt gruppe",
  })), [crud.data, users.data, sections.data, groups.data]);

  const open = (row?: Employment) => {
    setFormKey(k => k + 1);
    if (row) crud.edit(row); else crud.create();
  };
  const columns = useMemo<ColumnDef<EmploymentTableRow>[]>(() => [
    { id: "user", accessorKey: "userName", header: "Bruger" },
    { id: "section", accessorKey: "sectionName", header: "Afsnit" },
    { id: "group", accessorKey: "groupName", header: "Personalegruppe" },
    { accessorKey: "hoursPerWeek", header: "Timer/uge", cell: ({ row }) => `${row.original.hoursPerWeek} timer` },
    { accessorKey: "startDate", header: "Startdato", cell: ({ row }) => formatDate(row.original.startDate) },
    { accessorKey: "endDate", header: "Slutdato", cell: ({ row }) => formatDate(row.original.endDate) },
    { id: "actions", header: "Handlinger", enableSorting: false, enableGlobalFilter: false,
      cell: ({ row }) => <div className="row-actions">
        <button type="button" onClick={() => open(row.original)}>Rediger</button>
        <button type="button" className="danger-link" onClick={() => crud.askDelete(row.original)}>Slet</button>
      </div> },
  ], []);

  const busyReferences = users.loading || sections.loading || groups.loading;
  const referenceError = users.error || sections.error || groups.error;
  return <>
    <PageHeader title="Ansættelser" description="Tilknyt personale til afsnit og personalegrupper i afgrænsede datoer."
      actions={<Button onClick={() => open()} disabled={busyReferences || !!referenceError}>+ Opret ansættelse</Button>} />
    <div className="subnav" aria-label="Adgangsstyring">
      <Link to="/adgangsstyring/brugere">Brugere</Link>
      <Link to="/adgangsstyring/ansaettelser" className="selected">Ansættelser</Link>
    </div>
    <Notice message={crud.error || referenceError} /><Notice key={crud.messageId} kind="success" message={crud.message} />
    <section className="panel">
      {(crud.loading || busyReferences) ? <Loading /> :
        <DataTable data={rows} columns={columns} searchPlaceholder="Søg efter bruger, afsnit eller gruppe…"
          filters={[
            { columnId: "section", label: "Afsnit", options: sections.data.map(s => ({ value: s.name, label: s.name })) },
            { columnId: "group", label: "Personalegruppe", options: groups.data.map(g => ({ value: g.name, label: g.name })) },
          ]} />}
    </section>
    {crud.editing && <Dialog title={crud.editing === "new" ? "Opret ansættelse" : "Rediger ansættelse"} onClose={crud.closeEdit}>
      <EmploymentForm key={formKey} initial={crud.editing === "new" ? {
        userId: "", sectionId: "", staffGroupId: "", hoursPerWeek: 37, startDate: "", endDate: ""
      } : {
        userId: crud.editing.userId, sectionId: crud.editing.sectionId,
        staffGroupId: crud.editing.staffGroupId, hoursPerWeek: crud.editing.hoursPerWeek,
        startDate: crud.editing.startDate, endDate: crud.editing.endDate
      }} users={users.data} sections={sections.data} groups={groups.data}
        busy={crud.busy} error={crud.mutationError} cancel={crud.closeEdit} save={crud.save} />
    </Dialog>}
    {crud.deleting && <ConfirmDialog subject={`ansættelsen for ${userName(crud.deleting.userId)}`}
      busy={crud.busy} error={crud.mutationError} onCancel={crud.closeDelete}
      onConfirm={() => void crud.remove()} />}
  </>;
}
