import { NextResponse } from "next/server";
import { getPublishedArticles } from "@/lib/db/queries/articles";
import { getSiteSettings } from "@/lib/db/queries/settings";

export const revalidate = 3600;

export async function GET() {
  const [articles, settings] = await Promise.all([
    getPublishedArticles(),
    getSiteSettings(),
  ]);

  const siteTitle = settings?.siteTitle || "Lonnex Njenga";
  const tagline = settings?.tagline || "Full-stack developer & graphic designer";
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lonnex.dev";

  const itemsXml = articles
    .map((article) => {
      const articleUrl = `${baseUrl}/journal/${article.slug}`;
      const pubDate = new Date(article.createdAt).toUTCString();
      const tagsXml = article.tags
        .map((tag) => `<category><![CDATA[${tag.name}]]></category>`)
        .join("\n        ");

      return `    <item>
      <title><![CDATA[${article.title}]]></title>
      <link>${articleUrl}</link>
      <guid isPermaLink="true">${articleUrl}</guid>
      <description><![CDATA[${article.excerpt}]]></description>
      <pubDate>${pubDate}</pubDate>
      ${tagsXml}
    </item>`;
    })
    .join("\n");

  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title><![CDATA[${siteTitle} — Journal]]></title>
    <link>${baseUrl}/journal</link>
    <description><![CDATA[${tagline}]]></description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml"/>
${itemsXml}
  </channel>
</rss>`;

  return new NextResponse(rssXml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
