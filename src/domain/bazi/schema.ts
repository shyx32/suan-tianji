import { z } from "zod";

export const focusEnum = z.enum([
  "事业",
  "财运",
  "感情",
  "健康",
  "家庭",
  "人际",
  "开运",
]);

export const baziBodySchema = z.object({
  name: z.string().max(40).optional(),
  gender: z.enum(["male", "female"]),
  year: z.number().int().min(1900).max(2100),
  month: z.number().int().min(1).max(12),
  day: z.number().int().min(1).max(31),
  hour: z.number().int().min(0).max(23),
  minute: z.number().int().min(0).max(59).optional().default(0),
  birthplace: z.string().max(80).optional(),
  focus: z.array(focusEnum).min(1).max(7).optional().default(["事业", "财运", "感情"]),
  note: z.string().max(500).optional(),
});

export const personSchema = z.object({
  name: z.string().max(40).optional(),
  gender: z.enum(["male", "female"]),
  year: z.number().int().min(1900).max(2100),
  month: z.number().int().min(1).max(12),
  day: z.number().int().min(1).max(31),
  hour: z.number().int().min(0).max(23),
  minute: z.number().int().min(0).max(59).optional().default(0),
  birthplace: z.string().max(80).optional(),
});

export const hepanBodySchema = z.object({
  personA: personSchema,
  personB: personSchema,
  focus: z.array(focusEnum).min(1).max(7).optional().default(["感情", "人际"]),
});

export const namingBodySchema = z.object({
  surname: z.string().min(1).max(8),
  gender: z.enum(["male", "female", "unknown"]).default("unknown"),
  birthStatus: z.enum(["born", "expected"]),
  year: z.number().int().optional(),
  month: z.number().int().optional(),
  day: z.number().int().optional(),
  hour: z.number().int().optional(),
  minute: z.number().int().optional(),
  expectedDate: z.string().optional(),
  birthplace: z.string().max(80).optional(),
  givenNameLength: z.enum(["one", "two"]).default("two"),
  styles: z.array(z.string()).default(["清雅古典"]),
  generationCharacter: z.string().max(2).optional(),
  preferredCharacters: z.string().max(20).optional(),
  avoidCharacters: z.string().max(20).optional(),
  wishes: z.string().max(200).optional(),
  note: z.string().max(500).optional(),
});
