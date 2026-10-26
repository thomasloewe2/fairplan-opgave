import { useEffect, useMemo, useState, type FormEvent } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "../components/DataTable";
import { DateField } from "../components/DateField";
import { Button, ConfirmDialog, Dialog, Loading, Notice, PageHeader } from "../components/UI";
import { useCrud } from "../hooks/useCrud";
import { api, type Period, type PeriodInput } from "../services/apiService";
import { formatDate } from "../utils/display";

function PeriodEditor({ initial, saving, error, onCancel, onSave }: {
  initial: PeriodInput;
  saving: boolean;
  error: string | null;
  onCancel: () => void;
  onSave: (value: PeriodInput) => Promise<void>;
}) {
  const [values, setValues] = useState<PeriodInput>(initial);
  useEffect(() => { setValues(initial); }, [initial]);
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!values.startDate || !values.endDate || values.startDate >= values.endDate) return;
    void onSave(values);
  }
  const datesInvalid = !!values.startDate && !!values.endDate && values.startDate >= values.endDate;
  return <form onSubmit={submit}>
    <label className="field"><span>Navn</span><input required maxLength={100} value={values.name}
      onChange={e => setValues({ ...values, name: e.target.value })} placeholder="F.eks. Januar 2027" /></label>
    <div className="form-grid">
      <DateField label="Startdato" value={values.startDate} onChange={startDate => setValues(v => ({ ...v, startDate }))} />
      <DateField label="Slutdato" value={values.endDate} onChange={endDate => setValues(v => ({ ...v, endDate }))} />
    </div>
    {datesInvalid && <Notice message="Slutdato skal ligge efter startdato." />}
    <Notice message={error} />
    <div className="dialog-actions">
      <Button variant="secondary" type="button" onClick={onCancel}>Annuller</Button>
      <Button type="submit" disabled={saving || datesInvalid || !values.startDate || !values.endDate}>{saving ? "Gemmer…" : "Gem periode"}</Button>
    </div>
  </form>;
}

const empty: PeriodInput = { name: "", startDate: "", endDate: "" };

export default function Periods() {
  const crud = useCrud(api.periods);
  const [dialogKey, setDialogKey] = useState(0);
  const openNew = () => { setDialogKey(k => k + 1); crud.create(); };
  const openEdit = (period: Period) => { setDialogKey(k => k + 1); crud.edit(period); };
  const columns = useMemo<ColumnDef<Period>[]>(() => [
    { accessorKey: "name", header: "Navn" },
    { accessorKey: "startDate", header: "Startdato", cell: ctx => formatDate(ctx.row.original.startDate) },
    { accessorKey: "endDate", header: "Slutdato", cell: ctx => formatDate(ctx.row.original.endDate) },
    { id: "actions", header: "Handlinger", enableSorting: false, enableGlobalFilter: false,
      cell: ({ row }) => <div className="row-actions">
        <button type="button" onClick={() => openEdit(row.original)}>Rediger</button>
        <button type="button" className="danger-link" onClick={() => crud.askDelete(row.original)}>Slet</button>
      </div> },
  ], []);

  const selected = crud.editing;
  return <>
    <PageHeader title="Perioder" description="Opret planlægningsperioder uden overlap mellem datoerne."
      actions={<Button onClick={openNew}>+ Opret periode</Button>} />
    <Notice key={crud.messageId} kind="success" message={crud.message} />
    <Notice message={crud.error} />
    <section className="panel">
      {crud.loading && !crud.data.length ? <Loading /> : <DataTable data={crud.data} columns={columns}
        searchPlaceholder="Søg efter periode…" emptyText="Ingen perioder endnu. Opret den første periode." />}
    </section>
    {selected && <Dialog title={selected === "new" ? "Opret periode" : "Rediger periode"} onClose={crud.closeEdit}>
      <PeriodEditor key={dialogKey} initial={selected === "new" ? empty : {
        name: selected.name, startDate: selected.startDate, endDate: selected.endDate
      }} saving={crud.busy} error={crud.mutationError} onCancel={crud.closeEdit} onSave={crud.save} />
    </Dialog>}
    {crud.deleting && <ConfirmDialog subject={crud.deleting.name} busy={crud.busy}
      error={crud.mutationError} onCancel={crud.closeDelete} onConfirm={() => void crud.remove()} />}
  </>;
}
