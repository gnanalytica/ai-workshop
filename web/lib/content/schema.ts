import { z } from "zod";

const linkSchema = z.object({
  name: z.string().optional(),
  title: z.string().optional(),
  url: z.string(),
});

export const dayFrontmatterSchema = z.object({
  day: z.number().int().min(1).max(60),
  date: z.string().optional(),
  weekday: z.string().optional(),
  week: z.number().int().optional(),
  topic: z.string(),
  faculty: z
    .object({
      main: z.string().optional(),
      support: z.string().optional(),
    })
    .optional(),
  reading_time: z.string().optional(),
  tldr: z.string().optional(),
  tags: z.array(z.string()).default([]),
  software: z.array(z.string()).default([]),
  online_tools: z.array(z.string()).default([]),
  video: z.string().optional(),
  prompt_of_the_day: z.string().optional(),
  tools_hands_on: z.array(linkSchema).default([]),
  tools_reference: z.array(linkSchema).default([]),
  resources: z.array(linkSchema).default([]),
  lab: linkSchema.optional(),
  objective: z
    .object({
      topic: z.string().optional(),
      tools: z.array(z.string()).optional(),
      end_goal: z.string().optional(),
    })
    .optional(),
  demo: z.boolean().optional(),
});

export type DayFrontmatter = z.infer<typeof dayFrontmatterSchema>;
