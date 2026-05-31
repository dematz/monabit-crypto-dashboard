import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MoreHorizontal, Power, UserCheck, ShieldCheck, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { fetchUsers, toggleUserStatus, createUser } from '@/services/users-api';
import { useAppStore } from '@/stores/app-store';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { SearchInput } from '@/components/ui/search-input';
import { PageHeader } from '@/components/ui/page-header';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function UsersPage() {
  const user = useAppStore((s) => s.user);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [query, setQuery] = useState('');

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });

  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    email: '',
    password: '',
    display_name: '',
    role: 'user' as 'admin' | 'user',
  });

  const createMutation = useMutation({
    mutationFn: () => createUser(createForm),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User created');
      setShowCreate(false);
      setCreateForm({ email: '', password: '', display_name: '', role: 'user' });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Failed to create user'),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      toggleUserStatus(id, isActive),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(variables.isActive ? 'User activated' : 'User deactivated');
    },
    onError: (_err, variables) =>
      toast.error(variables.isActive ? 'Failed to activate user' : 'Failed to deactivate user'),
  });

  const rows = useMemo(() => {
    const base = users ?? [];
    return base.map((u) => ({
      id: u.id,
      name: u.display_name ?? u.email?.split('@')[0] ?? 'No name',
      email: u.email ?? '',
      role: (u.role === 'admin' ? 'Admin' : 'User') as 'Admin' | 'User',
      status: (u.is_active ? 'Active' : 'Inactive') as 'Active' | 'Inactive',
      createdAt: u.created_at ? new Date(u.created_at).toLocaleDateString('en-US') : '-',
    }));
  }, [users]);

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

  if (user?.role !== 'Admin') {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <div className="max-w-md rounded-2xl border border-border bg-surface p-8 text-center">
          <ShieldCheck className="mx-auto h-10 w-10 text-brand" />
          <h2 className="mt-3 text-lg font-semibold">Restricted access</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            This section is only available to administrators.
          </p>
          <button
            onClick={() => navigate('/')}
            className="mt-5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title="User Management"
          description="Manage members, roles, and platform permissions."
        />

        <div className="rounded-2xl border border-border bg-surface">
          <div className="flex items-center justify-between gap-2 border-b border-border p-4">
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder="Search by name or email..."
              className="max-w-sm"
            />
            <button
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3.5 py-2 text-sm font-semibold text-brand-foreground hover:opacity-90"
            >
              <Plus className="h-4 w-4" />
              Create User
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="hidden px-4 py-3 md:table-cell">Joined</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i} className="border-b border-border/60">
                        <td colSpan={6} className="px-4 py-3">
                          <Skeleton className="h-10 w-full rounded-md" />
                        </td>
                      </tr>
                    ))
                  : filtered.map((u) => (
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
                              u.status === 'Active'
                                ? 'bg-success/15 text-success'
                                : 'bg-danger/15 text-danger',
                            )}
                          >
                            <span
                              className={cn(
                                'h-1.5 w-1.5 rounded-full',
                                u.status === 'Active' ? 'bg-success' : 'bg-danger',
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
                                aria-label="Actions"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44">
                              {u.status === 'Active' ? (
                                <DropdownMenuItem
                                  onClick={() =>
                                    toggleMutation.mutate({ id: u.id, isActive: false })
                                  }
                                >
                                  <Power className="mr-2 h-4 w-4" /> Deactivate
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  onClick={() =>
                                    toggleMutation.mutate({ id: u.id, isActive: true })
                                  }
                                >
                                  <UserCheck className="mr-2 h-4 w-4" /> Activate
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                {!isLoading && filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-10 text-center text-sm text-muted-foreground"
                    >
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-xl">
            <h3 className="text-lg font-semibold">Create User</h3>
            <p className="mb-5 mt-1 text-sm text-muted-foreground">
              A verification email will be sent to the user.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createMutation.mutate();
              }}
              className="space-y-4"
            >
              <div>
                <label className="mb-1 block text-sm font-medium">Email</label>
                <input
                  type="email"
                  required
                  value={createForm.email}
                  onChange={(e) => setCreateForm((f) => ({ ...f, email: e.target.value }))}
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={createForm.password}
                  onChange={(e) => setCreateForm((f) => ({ ...f, password: e.target.value }))}
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Display Name</label>
                <input
                  type="text"
                  value={createForm.display_name}
                  onChange={(e) => setCreateForm((f) => ({ ...f, display_name: e.target.value }))}
                  placeholder="Optional"
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Role</label>
                <select
                  value={createForm.role}
                  onChange={(e) =>
                    setCreateForm((f) => ({ ...f, role: e.target.value as 'admin' | 'user' }))
                  }
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-accent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground hover:opacity-90 disabled:opacity-50"
                >
                  {createMutation.isPending ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
