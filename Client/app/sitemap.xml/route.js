import { getAllMangaSlugs, getChaptersSlugs } from "@/functions/index";

const baseUrl = process.env.BASE_URL;

export async function GET() {
  const mangas = await getAllMangaSlugs();
  let urls = [`${baseUrl}/`];

  for (const { slug } of mangas) {
    const mangaUrl = `${baseUrl}/${slug}`;
    urls.push(mangaUrl);

    const chapters = await getChaptersSlugs(slug);
    chapters.forEach(({ slug: chapterSlug }) => {
      urls.push(`${mangaUrl}/${chapterSlug}`);
    });
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${urls
      .map(
        (url) => `
      <url>
        <loc>${url}</loc>
        <changefreq>daily</changefreq>
        <priority>${url === baseUrl ? "1.0" : "0.8"}</priority>
      </url>`
      )
      .join("")}
  </urlset>`;

  return new Response(sitemap, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
