import { getAuthUserId } from '@convex-dev/auth/server';
import { paginationOptsValidator } from 'convex/server';
import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

const priorityValidator = v.union(v.literal('low'), v.literal('medium'), v.literal('high'));

const filterOperatorValidator = v.union(
  v.literal('eq'),
  v.literal('neq'),
  v.literal('contains'),
  v.literal('startsWith'),
  v.literal('endsWith'),
  v.literal('gt'),
  v.literal('gte'),
  v.literal('lt'),
  v.literal('lte'),
  v.literal('in')
);

const queryStateValidator = v.object({
  sorting: v.array(
    v.object({
      columnId: v.string(),
      direction: v.union(v.literal('asc'), v.literal('desc')),
    })
  ),
  filters: v.array(
    v.object({
      columnId: v.string(),
      op: filterOperatorValidator,
      value: v.union(v.string(), v.number(), v.boolean(), v.null(), v.array(v.string())),
    })
  ),
  pageSize: v.number(),
  cursor: v.union(v.string(), v.null()),
});

const rowPatchValidator = v.object({
  rowId: v.id('todos'),
  patch: v.object({
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    priority: v.optional(priorityValidator),
    dueDate: v.optional(v.union(v.string(), v.null())),
    completed: v.optional(v.boolean()),
  }),
});

const tableRowValidator = v.object({
  id: v.string(),
  title: v.string(),
  description: v.string(),
  priority: priorityValidator,
  dueDate: v.string(),
  createdAt: v.string(),
  updatedAt: v.string(),
  completed: v.boolean(),
});

function normalizeText(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed || undefined;
}

function parseDateString(value: string | null | undefined) {
  if (!value) {
    return undefined;
  }

  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? undefined : timestamp;
}

function getTodoFieldValue(
  todo: {
    title: string;
    description?: string;
    priority: 'low' | 'medium' | 'high';
    dueDate?: number;
    createdAt: number;
    updatedAt: number;
    completed: boolean;
  },
  columnId: string
) {
  switch (columnId) {
    case 'title':
      return todo.title;
    case 'description':
      return todo.description ?? '';
    case 'priority':
      return todo.priority;
    case 'dueDate':
      return todo.dueDate ?? null;
    case 'createdAt':
      return todo.createdAt;
    case 'updatedAt':
      return todo.updatedAt;
    case 'completed':
      return todo.completed;
    default:
      return null;
  }
}

function compareValues(left: unknown, right: unknown) {
  if (left === right) {
    return 0;
  }

  if (left === null || left === undefined) {
    return 1;
  }

  if (right === null || right === undefined) {
    return -1;
  }

  if (typeof left === 'string' && typeof right === 'string') {
    return left.localeCompare(right, undefined, { sensitivity: 'base' });
  }

  if (typeof left === 'boolean' && typeof right === 'boolean') {
    return Number(left) - Number(right);
  }

  return Number(left) - Number(right);
}

function matchesFilter(
  todo: {
    title: string;
    description?: string;
    priority: 'low' | 'medium' | 'high';
    dueDate?: number;
    createdAt: number;
    updatedAt: number;
    completed: boolean;
  },
  filter: {
    columnId: string;
    op: 'eq' | 'neq' | 'contains' | 'startsWith' | 'endsWith' | 'gt' | 'gte' | 'lt' | 'lte' | 'in';
    value: string | number | boolean | null | string[];
  }
) {
  const actual = getTodoFieldValue(todo, filter.columnId);

  switch (filter.op) {
    case 'eq':
      return compareValues(actual, filter.value) === 0;
    case 'neq':
      return compareValues(actual, filter.value) !== 0;
    case 'contains':
      return String(actual ?? '')
        .toLowerCase()
        .includes(String(filter.value).toLowerCase());
    case 'startsWith':
      return String(actual ?? '')
        .toLowerCase()
        .startsWith(String(filter.value).toLowerCase());
    case 'endsWith':
      return String(actual ?? '')
        .toLowerCase()
        .endsWith(String(filter.value).toLowerCase());
    case 'gt':
      return compareValues(actual, filter.value) > 0;
    case 'gte':
      return compareValues(actual, filter.value) >= 0;
    case 'lt':
      return compareValues(actual, filter.value) < 0;
    case 'lte':
      return compareValues(actual, filter.value) <= 0;
    case 'in':
      return Array.isArray(filter.value) ? filter.value.includes(String(actual ?? '')) : false;
    default:
      return true;
  }
}

export const list = query({
  args: {
    completed: v.optional(v.boolean()),
    priority: v.optional(priorityValidator),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    let todos;
    if (args.completed === undefined) {
      if (args.priority !== undefined) {
        todos = await ctx.db
          .query('todos')
          .withIndex('by_user_and_priority', (q: any) =>
            q.eq('userId', userId).eq('priority', args.priority)
          )
          .collect();
      } else {
        todos = await ctx.db
          .query('todos')
          .withIndex('by_user', (q: any) => q.eq('userId', userId))
          .collect();
      }
    } else {
      todos = await ctx.db
        .query('todos')
        .withIndex('by_user_and_completed', (q: any) =>
          q.eq('userId', userId).eq('completed', args.completed)
        )
        .collect();
    }

    return todos.toSorted((left, right) => right.createdAt - left.createdAt);
  },
});

export const listPage = query({
  args: {
    paginationOpts: paginationOptsValidator,
    state: queryStateValidator,
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return { page: [], continueCursor: '0', isDone: true };
    }

    const todos = await ctx.db
      .query('todos')
      .withIndex('by_user', (q: any) => q.eq('userId', userId))
      .collect();

    const filteredTodos = todos.filter((todo) =>
      args.state.filters.every((filter) => matchesFilter(todo, filter))
    );

    const sortedTodos = [...filteredTodos].toSorted((left, right) => {
      for (const sort of args.state.sorting) {
        const result = compareValues(
          getTodoFieldValue(left, sort.columnId),
          getTodoFieldValue(right, sort.columnId)
        );
        if (result !== 0) {
          return sort.direction === 'asc' ? result : -result;
        }
      }

      return right.createdAt - left.createdAt;
    });

    const start = Number.parseInt(args.paginationOpts.cursor ?? '0', 10);
    const safeStart = Number.isNaN(start) ? 0 : start;
    const page = sortedTodos.slice(safeStart, safeStart + args.paginationOpts.numItems);
    const nextOffset = safeStart + page.length;
    const isDone = nextOffset >= sortedTodos.length;

    return {
      page,
      continueCursor: String(nextOffset),
      isDone,
    };
  },
});

export const get = query({
  args: { id: v.id('todos') },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const todo = await ctx.db.get(args.id);
    if (todo?.userId !== userId) {
      return null;
    }

    return todo;
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    priority: priorityValidator,
    dueDate: v.optional(v.float64()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error('Not authenticated');
    }

    const now = Date.now();
    return await ctx.db.insert('todos', {
      userId,
      title: args.title,
      description: args.description,
      priority: args.priority,
      dueDate: args.dueDate,
      completed: false,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const createForTable = mutation({
  args: {
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    priority: v.optional(priorityValidator),
    dueDate: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error('Not authenticated');
    }

    const now = Date.now();
    const id = await ctx.db.insert('todos', {
      userId,
      title: normalizeText(args.title) ?? 'Untitled todo',
      description: normalizeText(args.description),
      priority: args.priority ?? 'medium',
      dueDate: parseDateString(args.dueDate),
      completed: false,
      createdAt: now,
      updatedAt: now,
    });

    return await ctx.db.get(id);
  },
});

export const update = mutation({
  args: {
    id: v.id('todos'),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    completed: v.optional(v.boolean()),
    priority: v.optional(priorityValidator),
    dueDate: v.optional(v.float64()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error('Not authenticated');
    }

    const todo = await ctx.db.get(args.id);
    if (todo?.userId !== userId) {
      throw new Error('Todo not found');
    }

    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });

    return await ctx.db.get(id);
  },
});

export const updateBatch = mutation({
  args: {
    changes: v.array(rowPatchValidator),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error('Not authenticated');
    }

    for (const change of args.changes) {
      const todoId = change.rowId;
      const todo = await ctx.db.get(todoId);
      if (todo?.userId !== userId) {
        throw new Error('Todo not found');
      }

      await ctx.db.patch(todoId, {
        title:
          change.patch.title === undefined
            ? undefined
            : (normalizeText(change.patch.title) ?? 'Untitled todo'),
        description:
          change.patch.description === undefined
            ? undefined
            : normalizeText(change.patch.description),
        priority: change.patch.priority,
        dueDate:
          change.patch.dueDate === undefined ? undefined : parseDateString(change.patch.dueDate),
        completed: change.patch.completed,
        updatedAt: Date.now(),
      });
    }
  },
});

export const remove = mutation({
  args: { id: v.id('todos') },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error('Not authenticated');
    }

    const todo = await ctx.db.get(args.id);
    if (todo?.userId !== userId) {
      throw new Error('Todo not found');
    }

    await ctx.db.delete(args.id);
  },
});

export const deleteBatch = mutation({
  args: {
    rowIds: v.array(v.id('todos')),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error('Not authenticated');
    }

    for (const rowId of args.rowIds) {
      const todoId = rowId;
      const todo = await ctx.db.get(todoId);
      if (todo?.userId !== userId) {
        throw new Error('Todo not found');
      }

      await ctx.db.delete(todoId);
    }
  },
});

export const restoreBatch = mutation({
  args: {
    rows: v.array(tableRowValidator),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error('Not authenticated');
    }

    for (const row of args.rows) {
      await ctx.db.insert('todos', {
        userId,
        title: normalizeText(row.title) ?? 'Untitled todo',
        description: normalizeText(row.description),
        priority: row.priority,
        dueDate: parseDateString(row.dueDate),
        createdAt: parseDateString(row.createdAt) ?? Date.now(),
        updatedAt: parseDateString(row.updatedAt) ?? Date.now(),
        completed: row.completed,
      });
    }
  },
});

export const toggleComplete = mutation({
  args: { id: v.id('todos') },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error('Not authenticated');
    }

    const todo = await ctx.db.get(args.id);
    if (todo?.userId !== userId) {
      throw new Error('Todo not found');
    }

    await ctx.db.patch(args.id, {
      completed: !todo.completed,
      updatedAt: Date.now(),
    });

    return await ctx.db.get(args.id);
  },
});
