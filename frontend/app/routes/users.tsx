import { useMemo, useState, type SubmitEvent } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router";
import { DataTable } from "../components/DataTable";
import { Button, ConfirmDialog, Dialog, Loading, Notice, PageHeader } from "../components/UI";
import { useCrud } from "../hooks/useCrud";
import { api, type User, type UserInput } from "../services/apiService";

function UserForm({ initial, busy, error, cancel, save }: {
  initial: UserInput; busy: boolean; error: string | null;
  cancel: () => void; save: (value: UserInput) => Promise<void>;
}) {
  const [value, setValue] = useState(initial);
  const hasRole = value.isAdmin || value.isPersonnel;
  return <form onSubmit={(e: SubmitEvent<HTMLFormElement>) => { e.preventDefault(); if (hasRole) void save(value); }}>
    <label className="field"><span>Fulde navn</span>
      <input required maxLength={100} value={value.fullName} placeholder="F.eks. Anna Jensen"
        onChange={e => setValue({ ...value, fullName: e.target.value })} /></label>
    <label className="field"><span>E-mail</span>
      <input required type="email" maxLength={254} value={value.email} placeholder="anna@example.dk"
        onChange={e => setValue({ ...value, email: e.target.value })} /></label>
    <fieldset className="role-fieldset">
      <legend>Roller</legend>
      <label className="check-label"><input type="checkbox" checked={value.isAdmin}
        onChange={e => setValue({ ...value, isAdmin: e.target.checked })} /> Administrator</label>
      <label className="check-label"><input type="checkbox" checked={value.isPersonnel}
        onChange={e => setValue({ ...value, isPersonnel: e.target.checked })} /> Personale</label>
      <small className="muted">En bruger kan have én eller begge roller.</small>
    </fieldset>
    {!hasRole && <Notice message="Vælg mindst én rolle." />}
    <Notice message={error} />
    <div className="dialog-actions">
      <Button type="button" variant="secondary" onClick={cancel}>Annuller</Button>
      <Button type="submit" disabled={busy || !hasRole}>{busy ? "Gemmer…" : "Gem bruger"}</Button>
    </div>
  </form>;
}

export default function Users() {
  const crud = useCrud(api.users);
  const [formKey, setFormKey] = useState(0);
  const open = (row?: User) => {
    setFormKey(k => k + 1);
    if (row) crud.edit(row); else crud.create();
  };
  const columns = useMemo<ColumnDef<User>[]>(() => [
    { accessorKey: "fullName", header: "Navn" },
    { accessorKey: "email", header: "E-mail" },
    { id: "isAdmin", accessorFn: row => row.isAdmin ? "Ja" : "Nej", header: "Admin",
      cell: ({ row }) => <span className={row.original.isAdmin ? "role-pill role-yes" : "role-pill role-no"}>
        {row.original.isAdmin ? "Ja" : "Nej"}</span> },
    { id: "isPersonnel", accessorFn: row => row.isPersonnel ? "Ja" : "Nej", header: "Personale",
      cell: ({ row }) => <span className={row.original.isPersonnel ? "role-pill role-yes" : "role-pill role-no"}>
        {row.original.isPersonnel ? "Ja" : "Nej"}</span> },
    { id: "actions", header: "Handlinger", enableSorting: false, enableGlobalFilter: false,
      cell: ({ row }) => <div className="row-actions">
        <button type="button" onClick={() => open(row.original)}>Rediger</button>
        <button type="button" className="danger-link" onClick={() => crud.askDelete(row.original)}>Slet</button>
      </div> },
  ], []);
  return <>
    <PageHeader title="Adgange" description="Administrer brugere og deres roller."
      actions={<Button onClick={() => open()}>+ Opret bruger</Button>} />
    <div className="subnav" aria-label="Adgangsstyring">
      <Link to="/adgangsstyring/brugere" className="selected">Brugere</Link>
      <Link to="/adgangsstyring/ansaettelser">Ansættelser</Link>
    </div>
    <Notice message={crud.error} /><Notice kind="success" message={crud.message} />
    <section className="panel">
      {crud.loading && !crud.data.length ? <Loading /> :
        <DataTable data={crud.data} columns={columns} searchPlaceholder="Søg efter navn eller e-mail…"
          filters={[
            { columnId: "isAdmin", label: "Administrator", options: [{ value: "Ja", label: "Ja" }, { value: "Nej", label: "Nej" }] },
            { columnId: "isPersonnel", label: "Personale", options: [{ value: "Ja", label: "Ja" }, { value: "Nej", label: "Nej" }] },
          ]} />}
    </section>
    {crud.editing && <Dialog title={crud.editing === "new" ? "Opret bruger" : "Rediger bruger"} onClose={crud.closeEdit}>
      <UserForm key={formKey} initial={crud.editing === "new"
        ? { fullName: "", email: "", isAdmin: false, isPersonnel: true }
        : { fullName: crud.editing.fullName, email: crud.editing.email,
          isAdmin: crud.editing.isAdmin, isPersonnel: crud.editing.isPersonnel }}
        error={crud.mutationError} busy={crud.busy} cancel={crud.closeEdit} save={crud.save} />
    </Dialog>}
    {crud.deleting && <ConfirmDialog subject={crud.deleting.fullName} busy={crud.busy}
      error={crud.mutationError} onCancel={crud.closeDelete} onConfirm={() => void crud.remove()} />}
  </>;
}
