import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreHorizontal, Pencil, Plus, Power, Search, ShieldCheck, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { MOCK_USERS } from '@/lib/mock-data';
import type { UserRow } from '@/types';
import { useAppStore } from '@/stores/app-store';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function UsersPage() {
  const user = useAppStore((s) => s.user);
  const navigate = useNavigate();
  const [rows, setRows] = useState<UserRow[]>(MOCK_USERS);
  const [query, setQuery] = useState('');

  if (user?.role !== 'Admin') {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <div className="max-w-md rounded-2xl border border-border bg-surface p-8 text-center">
          <ShieldCheck className="mx-auto h-10 w-10 text-brand" />
          <h2 className="mt-3 text-lg font-semibold">Acceso restringido</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Esta sección está disponible únicamente para administradores.
          </p>
          <button
            onClick={() => navigate('/')}
            className="mt-5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground"
          >
            Volver al dashboard
          </button>
        </div>
      </div>
    );
  }

  const filtered = useMemo(
    () =>
      rows.filter((r) =>
        query
          ? r.name.toLowerCase().includes(query.toLowerCase()) ||
            r.email.toLowerCase().includes(query.toLowerCase())
          : true,
      ),
    [rows, query],
  );

  const toggleStatus = (id: string) => {
    setRows((rs) =>
      rs.map((r) =>
        r.id === id ? { ...r, status: r.status === 'Activo' ? 'Inactivo' : 'Activo' } : r,
      ),
    );
    toast.success('Estado actualizado');
  };

  const remove = (id: string) => {
    setRows((rs) => rs.filter((r) => r.id !== id));
    toast.success('Usuario eliminado');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Gestión de usuarios</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Administrá miembros, roles y permisos de la plataforma.
          </p>
        </div>
        <button
          onClick={() => toast.message('Demo: alta de usuario simulada')}
          className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> Nuevo usuario
        </button>
      </div>

      <div className="rounded-2xl border border-border bg-surface">
        <div className="flex items-center gap-2 border-b border-border p-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nombre o email..."
              className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Rol</th>
                <th className="px-4 py-3">Estado</th>
                <th className="hidden px-4 py-3 md:table-cell">Alta</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-border/60 transition-colors hover:bg-accent/40"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="grid h-9 w-9 place-items-center rounded-full bg-accent text-sm font-semibold">
                        {u.name.charAt(0)}
                      </div>
                      <span className="font-medium">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
                        u.role === 'Admin'
                          ? 'bg-brand/15 text-brand'
                          : 'bg-accent text-muted-foreground',
                      )}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium',
                        u.status === 'Activo'
                          ? 'bg-success/15 text-success'
                          : 'bg-danger/15 text-danger',
                      )}
                    >
                      <span
                        className={cn(
                          'h-1.5 w-1.5 rounded-full',
                          u.status === 'Activo' ? 'bg-success' : 'bg-danger',
                        )}
                      />
                      {u.status}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                    {u.createdAt}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                          aria-label="Acciones"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem onClick={() => toast.message('Edición simulada')}>
                          <Pencil className="mr-2 h-4 w-4" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggleStatus(u.id)}>
                          <Power className="mr-2 h-4 w-4" />
                          {u.status === 'Activo' ? 'Desactivar' : 'Activar'}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => remove(u.id)}
                          className="text-danger focus:text-danger"
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-muted-foreground">
                    No se encontraron usuarios.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
