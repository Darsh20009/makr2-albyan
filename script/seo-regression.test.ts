import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { applySeoTemplate } from "../server/seo-template";
import { createSEOMiddleware, registerSitemapRoute } from "../server/seo";
import { albayanFaq } from "../shared/albayan-faq";

function response() {
  return {
    locals: {} as any, headers: {} as Record<string, string>, body: "", code: 200,
    setHeader(key: string, value: string) { this.headers[key] = value; },
    type() { return this; },
    status(code: number) { this.code = code; return this; },
    send(body: string) { this.body = body; return this; },
  };
}
const db = { collection: () => ({ findOne: async () => null }) };
const template = readFileSync("client/index.html", "utf8");
const request = (path: string, ua: string) => ({
  method: "GET", path, protocol: "https", get: () => "example.org",
  headers: { "user-agent": ua },
});

test("people and crawlers receive identical metadata and no self redirect", async () => {
  const middleware = createSEOMiddleware(db as any);
  const browser = response(), crawler = response();
  await middleware(request("/", "Mozilla/5.0") as any, browser as any, () => {});
  await middleware(request("/", "Googlebot") as any, crawler as any, () => {});
  assert.equal(browser.locals.seoDocument, crawler.locals.seoDocument);
  const html = applySeoTemplate(template, browser.locals.seoDocument);
  assert.equal((html.match(/<title>/g) || []).length, 1);
  assert.equal((html.match(/rel="canonical"/g) || []).length, 1);
  assert.doesNotMatch(html, /http-equiv="refresh"|جمعية طويق/);
  assert.match(html, /src="\/src\/main.tsx"/);
  const schemas = [...html.matchAll(/type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .map(match => JSON.parse(match[1]));
  const faq = schemas.find(s => s["@type"] === "FAQPage");
  assert.deepEqual(faq.mainEntity.map((q: any) => q.name), albayanFaq.map(q => q.title));
  assert.match(html, /<noscript>[\s\S]*حلقات تحفيظ/);
});

test("private account and receipt pages have noindex and no public schemas", async () => {
  for (const path of ["/profile", "/admin", "/notifications", "/track-donation", "/donation-success"]) {
    const res = response();
    await createSEOMiddleware(db as any)(request(path, "Googlebot") as any, res as any, () => {});
    assert.equal(res.headers["X-Robots-Tag"], "noindex, nofollow");
    const html = applySeoTemplate(template, res.locals.seoDocument, res.locals.seoNoindex);
    assert.match(html, /content="noindex, nofollow"/);
    assert.doesNotMatch(html, /application\/ld\+json/);
  }
});

test("sitemap includes only public Al-Bayan campaign IDs and real timestamps", async () => {
  const routes: Record<string, Function> = {};
  let filter: any;
  const fakeDb = { collection: () => ({ find: (query: any) => {
    filter = query;
    return { toArray: async () => [{ _id: "507f1f77bcf86cd799439011", updatedAt: "2026-01-01" }] };
  } }) };
  registerSitemapRoute({ get: (path: string, handler: Function) => { routes[path] = handler; } }, fakeDb as any);
  const res = response();
  await routes["/sitemap.xml"](request("/sitemap.xml", "") as any, res);
  assert.equal(filter.isPublic, true);
  assert.equal(filter.isActive, true);
  assert.equal(filter.licenseNumber, "1000863300");
  assert.match(res.body, /campaigns\/507f1f77bcf86cd799439011/);
  assert.doesNotMatch(res.body, /\/services|\/jobs|\/bank-transfer|\/profile/);
  assert.equal((res.body.match(/<lastmod>/g) || []).length, 1);
  const robots = response();
  routes["/robots.txt"](request("/robots.txt", "") as any, robots);
  assert.match(robots.body, /Sitemap: https:\/\/.+\/sitemap.xml/);
});
