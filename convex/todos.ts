import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("todos").order("desc").collect();
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    dueDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const todos = await ctx.db.query("todos").collect();
    const maxOrder = Math.max(...todos.map(t => t.order), 0);
    
    return await ctx.db.insert("todos", {
      title: args.title,
      description: args.description,
      dueDate: args.dueDate,
      completed: false,
      order: maxOrder + 1,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("todos"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    dueDate: v.optional(v.string()),
    completed: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    await ctx.db.patch(id, fields);
  },
});

export const remove = mutation({
  args: { id: v.id("todos") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const reorder = mutation({
  args: {
    updates: v.array(v.object({ id: v.id("todos"), order: v.number() })),
  },
  handler: async (ctx, args) => {
    await Promise.all(
      args.updates.map(({ id, order }) => ctx.db.patch(id, { order }))
    );
  },
});