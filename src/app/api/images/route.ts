import { type NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

function getImagesRecursive(dir: string, baseDir: string): { name: string, path: string, url: string }[] {
  let images: { name: string, path: string, url: string }[] = [];
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      images = images.concat(getImagesRecursive(fullPath, baseDir));
    } else {
      const ext = path.extname(file).toLowerCase();
      if (['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'].includes(ext)) {
        const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
        images.push({
          name: file,
          path: relativePath,
          url: `/${relativePath}`
        });
      }
    }
  }

  return images;
}

export async function GET(request: NextRequest) {
  const publicDir = path.join(process.cwd(), 'public');
  
  if (!fs.existsSync(publicDir)) {
    return Response.json({ images: [] });
  }

  try {
    const images = getImagesRecursive(publicDir, publicDir);
    return Response.json({ images });
  } catch (error) {
    return Response.json({ images: [] });
  }
}
