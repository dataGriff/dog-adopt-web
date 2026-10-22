// Soft tints for dogs without a photo, each with a text colour that passes
// 4.5:1 on its own background. Picked per dog from its id so the same dog
// always gets the same tint and neighbouring cards differ.
const TINTS = [
  'bg-[hsl(30_80%_92%)] text-[hsl(21_90%_28%)]',
  'bg-[hsl(152_40%_90%)] text-[hsl(152_65%_20%)]',
  'bg-[hsl(210_60%_92%)] text-[hsl(215_60%_28%)]',
  'bg-[hsl(270_45%_93%)] text-[hsl(270_45%_32%)]',
  'bg-[hsl(45_85%_88%)] text-[hsl(32_80%_22%)]',
  'bg-[hsl(340_60%_93%)] text-[hsl(340_55%_30%)]',
] as const;

export function tintFor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return TINTS[hash % TINTS.length]!;
}
