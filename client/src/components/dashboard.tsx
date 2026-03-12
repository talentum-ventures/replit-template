import { useMemo } from 'react';
import { useAuthActions } from '@convex-dev/auth/react';
import {
  DataTable,
  DataTableContainer,
  type DataTableColumn,
  type DataTableQueryState,
  type DataTableRowAction,
  type RowPatch,
} from '@talentum-ventures/convex-datatable';
import { useConvexDataSource, useConvexPresence } from '@talentum-ventures/convex-datatable/convex';
import { useMutation, useQuery } from 'convex/react';
import { CheckCircle2, LogOut, User, Zap } from 'lucide-react';
import type { Id } from '../../../convex/_generated/dataModel';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { ThemeToggle } from '@/components/theme-toggle';
import { api } from '../../../convex/_generated/api';

type TodoPriority = 'low' | 'medium' | 'high';

type TodoRow = {
  id: string;
  title: string;
  description: string;
  priority: TodoPriority;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  completed: boolean;
};

type CurrentUser = {
  _id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

const priorityOptions = [
  { value: 'low', label: 'Low', colorClass: 'bg-emerald-100 text-emerald-800' },
  { value: 'medium', label: 'Medium', colorClass: 'bg-amber-100 text-amber-900' },
  { value: 'high', label: 'High', colorClass: 'bg-rose-100 text-rose-800' },
] as const;

function isPriority(value: unknown): value is TodoPriority {
  return value === 'low' || value === 'medium' || value === 'high';
}

function normalizeFilterValue(
  value: string | number | boolean | null | readonly string[]
): string | number | boolean | null | string[] {
  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    value === null
  ) {
    return value;
  }

  return [...value];
}

function formatDateLabel(value: string | Date) {
  if (!value) {
    return 'No date';
  }

  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(value));
}

function toTodoRow(todo: {
  _id: string;
  title: string;
  description?: string;
  priority: TodoPriority;
  dueDate?: number;
  createdAt: number;
  updatedAt: number;
  completed: boolean;
}): TodoRow {
  return {
    id: String(todo._id),
    title: todo.title,
    description: todo.description ?? '',
    priority: todo.priority,
    dueDate: todo.dueDate ? new Date(todo.dueDate).toISOString() : '',
    createdAt: new Date(todo.createdAt).toISOString(),
    updatedAt: new Date(todo.updatedAt).toISOString(),
    completed: todo.completed,
  };
}

function toRestoreRow(row: TodoRow) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    priority: row.priority,
    dueDate: row.dueDate,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    completed: row.completed,
  };
}

function toBatchPatch(change: RowPatch<TodoRow>) {
  const patch: {
    title?: string;
    description?: string;
    priority?: TodoPriority;
    dueDate?: string | null;
    completed?: boolean;
  } = {};

  if ('title' in change.patch && typeof change.patch.title === 'string') {
    patch.title = change.patch.title;
  }

  if ('description' in change.patch && typeof change.patch.description === 'string') {
    patch.description = change.patch.description;
  }

  if ('priority' in change.patch && isPriority(change.patch.priority)) {
    patch.priority = change.patch.priority;
  }

  if ('dueDate' in change.patch) {
    patch.dueDate =
      typeof change.patch.dueDate === 'string' && change.patch.dueDate
        ? change.patch.dueDate
        : null;
  }

  if ('completed' in change.patch && typeof change.patch.completed === 'boolean') {
    patch.completed = change.patch.completed;
  }

  return {
    rowId: change.rowId,
    patch,
  };
}

function useTodoPage(args: {
  cursor: string | null;
  pageSize: number;
  state: DataTableQueryState;
}) {
  const result = useQuery(api.todos.listPage, {
    paginationOpts: {
      cursor: args.cursor,
      numItems: args.pageSize,
    },
    state: {
      cursor: args.state.cursor,
      pageSize: args.state.pageSize,
      sorting: args.state.sorting.map((sort) => ({ ...sort })),
      filters: args.state.filters.map((filter) => ({
        ...filter,
        value: normalizeFilterValue(filter.value),
      })),
    },
  });

  if (result === undefined) {
    return {
      rows: [],
      nextCursor: null,
      status: 'loading' as const,
      error: null,
    };
  }

  return {
    rows: result.page.map(toTodoRow),
    nextCursor: result.isDone ? null : result.continueCursor,
    status: 'loaded' as const,
    error: null,
  };
}

function TodoDashboardTable({
  currentUser,
  onError,
}: {
  readonly currentUser: CurrentUser;
  readonly onError: (message: string) => void;
}) {
  const createTodo = useMutation(api.todos.createForTable);
  const updateBatch = useMutation(api.todos.updateBatch);
  const deleteBatch = useMutation(api.todos.deleteBatch);
  const restoreBatch = useMutation(api.todos.restoreBatch);
  const toggleComplete = useMutation(api.todos.toggleComplete);
  const heartbeat = useMutation(api.presence.heartbeat);

  const dataSource = useConvexDataSource<TodoRow>({
    tableId: 'todos',
    pageSize: 25,
    usePageQuery: useTodoPage,
    createRow: async (draft) => {
      const createdTodo = await createTodo({
        title: typeof draft.title === 'string' ? draft.title : undefined,
        description: typeof draft.description === 'string' ? draft.description : undefined,
        priority: isPriority(draft.priority) ? draft.priority : undefined,
        dueDate: typeof draft.dueDate === 'string' && draft.dueDate ? draft.dueDate : null,
      });

      if (!createdTodo) {
        throw new Error('Failed to create todo');
      }

      return toTodoRow(createdTodo);
    },
    updateRows: async (changes) => {
      await updateBatch({
        changes: changes.map((change) => ({
          ...toBatchPatch(change),
          rowId: change.rowId as Id<'todos'>,
        })),
      });
    },
    deleteRows: async (rowIds) => {
      await deleteBatch({ rowIds: rowIds.map((rowId) => rowId as Id<'todos'>) });
    },
    restoreRows: async (rows) => {
      await restoreBatch({
        rows: rows.map(toRestoreRow),
      });
    },
  });

  const presence = useConvexPresence({
    tableId: 'todos',
    userId: currentUser._id,
    userName: currentUser.name ?? currentUser.email ?? 'User',
    usePresenceData: (tableId) => useQuery(api.presence.getPresence, { tableId }) ?? [],
    sendHeartbeat: async (entry) => {
      await heartbeat(entry);
    },
  });

  const columns = useMemo<ReadonlyArray<DataTableColumn<TodoRow>>>(
    () => [
      {
        id: 'title',
        field: 'title',
        header: 'Title',
        kind: 'text',
        isEditable: true,
        placeholder: 'What needs to be done?',
        renderCell: ({ row, value }) => (
          <span className={row.completed ? 'line-through text-muted-foreground' : undefined}>
            {value || 'Untitled todo'}
          </span>
        ),
      },
      {
        id: 'description',
        field: 'description',
        header: 'Description',
        kind: 'longText',
        isEditable: true,
        placeholder: 'Add more context',
        maxLines: 3,
      },
      {
        id: 'priority',
        field: 'priority',
        header: 'Priority',
        kind: 'select',
        isEditable: true,
        options: priorityOptions.map((option) => ({ ...option })),
      },
      {
        id: 'dueDate',
        field: 'dueDate',
        header: 'Due Date',
        kind: 'date',
        isEditable: true,
        dateStyle: 'medium',
        renderCell: ({ value }) => formatDateLabel(value),
      },
      {
        id: 'createdAt',
        field: 'createdAt',
        header: 'Created',
        kind: 'date',
        dateStyle: 'medium',
        renderCell: ({ value }) => formatDateLabel(value),
      },
    ],
    []
  );

  const rowActions = useMemo<ReadonlyArray<DataTableRowAction<TodoRow>>>(
    () => [
      {
        id: 'toggle-complete',
        label: 'Toggle complete',
        icon: CheckCircle2,
        onSelect: async ({ rowId }) => {
          await toggleComplete({ id: rowId as Id<'todos'> });
        },
      },
    ],
    [toggleComplete]
  );

  return (
    <DataTableContainer>
      <DataTable
        tableId="todos"
        columns={columns}
        getRowId={(row) => row.id}
        dataSource={dataSource}
        rowActions={rowActions}
        features={{
          editing: true,
          rowAdd: true,
          rowDelete: true,
          undo: true,
        }}
        collaborators={presence.collaborators}
        onActiveCellChange={presence.onActiveCellChange}
        onError={onError}
      />
    </DataTableContainer>
  );
}

export function Dashboard() {
  const { signOut } = useAuthActions();
  const { toast } = useToast();
  const currentUser = useQuery(api.users.current, {});

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: 'Signed out',
        description: 'You have been signed out successfully.',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to sign out',
        variant: 'destructive',
      });
    }
  };

  const displayName = currentUser?.name ?? 'User';
  const displayEmail = currentUser?.email ?? 'Signed in with Convex Auth';
  const avatarFallback = displayName.charAt(0).toUpperCase() || 'U';

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between gap-4 px-4 md:px-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg hidden sm:inline-block">Dashboard</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-9 w-9 rounded-full"
                  data-testid="button-user-menu"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={currentUser?.image ?? undefined} />
                    <AvatarFallback>{avatarFallback}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{displayName}</p>
                    <p className="text-xs leading-none text-muted-foreground">{displayEmail}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem data-testid="menu-profile">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} data-testid="menu-signout">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="flex-1 container px-4 md:px-6 py-6 md:py-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Welcome to your Dashboard!
            </h1>
            <p className="mt-1 text-muted-foreground">
              Manage your todos with live Convex-backed data, editing, and presence.
            </p>
          </div>

          {currentUser ? (
            <TodoDashboardTable
              currentUser={currentUser}
              onError={(message) =>
                toast({
                  title: 'Table error',
                  description: message,
                  variant: 'destructive',
                })
              }
            />
          ) : (
            <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
              Loading your workspace...
            </div>
          )}
        </div>
      </main>

      <footer className="border-t py-4">
        <div className="container px-4 md:px-6">
          <p className="text-center text-sm text-muted-foreground">
            Built with Vite + Convex + convex-datatable
          </p>
        </div>
      </footer>
    </div>
  );
}
