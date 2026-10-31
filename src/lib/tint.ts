// Soft tints for dogs without a photo, each with a text colour that passes
// 4.5:1 on its own background. Picked per dog from its id so the same dog
// always gets the same tint and neighbouring cards differ.
//
// The tints are decorative only, so they stay in blues, purples and slate:
// green, amber/orange and red already mean available, reserved/fostered and
// "no" elsewhere on the site, and a placeholder in those colours could be
// read as a status.
const TINTS = [
  'bg-[hsl(200_70%_92%)] text-[hsl(205_80%_24%)]', // sky
  'bg-[hsl(220_65%_93%)] text-[hsl(222_60%_30%)]', // blue
  'bg-[hsl(238_55%_94%)] text-[hsl(240_45%_34%)]', // indigo
  'bg-[hsl(265_50%_94%)] text-[hsl(268_45%_33%)]', // violet
  'bg-[hsl(215_25%_92%)] text-[hsl(215_30%_27%)]', // slate
] as const;

export function tintFor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return TINTS[hash % TINTS.length]!;
}
