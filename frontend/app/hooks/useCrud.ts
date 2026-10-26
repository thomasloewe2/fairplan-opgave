import { useState } from "react";
import { useResource } from "./useResource";
import type { CrudResource } from "../services/apiService";
import { displayError } from "../utils/display";

export function useCrud<T extends { id: string }, TInput>(resource: CrudResource<T, TInput>) {
  const list = useResource(resource.list, [] as T[]);
  const [editing, setEditing] = useState<T | "new" | null>(null);
  const [deleting, setDeleting] = useState<T | null>(null);
  const [busy, setBusy] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  function create() { setMutationError(null); setEditing("new"); }
  function edit(row: T) { setMutationError(null); setEditing(row); }
  function askDelete(row: T) { setMutationError(null); setDeleting(row); }
  function closeEdit() { if (!busy) setEditing(null); }
  function closeDelete() { if (!busy) setDeleting(null); }

  async function save(values: TInput) {
    setBusy(true);
    setMutationError(null);
    try {
      if (editing && editing !== "new") {
        await resource.update(editing.id, values);
        setMessage("Ændringerne er gemt.");
      } else {
        await resource.create(values);
        setMessage("Oprettet.");
      }
      setEditing(null);
      list.refresh();
    } catch (error) {
      setMutationError(displayError(error));
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!deleting) return;
    setBusy(true);
    setMutationError(null);
    try {
      await resource.remove(deleting.id);
      setMessage("Slettet.");
      setDeleting(null);
      list.refresh();
    } catch (error) {
      setMutationError(displayError(error));
    } finally {
      setBusy(false);
    }
  }

  return {
    ...list, editing, deleting, busy, mutationError, message,
    create, edit, askDelete, closeEdit, closeDelete, save, remove,
  };
}
