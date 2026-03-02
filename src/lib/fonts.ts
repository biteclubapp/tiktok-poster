import { readFile } from 'fs/promises';
import { join } from 'path';

const FONTS_DIR = join(process.cwd(), 'src', 'fonts');

let fontsCache: { name: string; data: ArrayBuffer; weight: number; style: string }[] | null = null;

export async function loadFonts() {
  if (fontsCache) return fontsCache;

  const fontFiles = [
    { file: 'DMSans-Light.ttf', name: 'DM Sans', weight: 300, style: 'normal' },
    { file: 'DMSans-Regular.ttf', name: 'DM Sans', weight: 400, style: 'normal' },
    { file: 'DMSans-Medium.ttf', name: 'DM Sans', weight: 500, style: 'normal' },
    { file: 'DMSans-SemiBold.ttf', name: 'DM Sans', weight: 600, style: 'normal' },
    { file: 'DMSans-Bold.ttf', name: 'DM Sans', weight: 700, style: 'normal' },
    { file: 'DMSerifDisplay-Regular.ttf', name: 'DM Serif Display', weight: 400, style: 'normal' },
    { file: 'CormorantGaramond-Light.ttf', name: 'Cormorant Garamond', weight: 300, style: 'normal' },
    { file: 'CormorantGaramond-Regular.ttf', name: 'Cormorant Garamond', weight: 400, style: 'normal' },
  ];

  fontsCache = await Promise.all(
    fontFiles.map(async ({ file, name, weight, style }) => {
      const data = await readFile(join(FONTS_DIR, file));
      return {
        name,
        data: data.buffer as ArrayBuffer,
        weight: weight as 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900,
        style: style as 'normal' | 'italic',
      };
    })
  );

  return fontsCache;
}
