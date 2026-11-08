import { useEffect } from "react";

interface SEOOptions {
  title: string;
  description?: string;
  image?: string;
  type?: "website" | "article";
  url?: string;
}

const SITE_NAME = "مقارئ البيان لتعليم القرآن الكريم";
const BASE_URL = window.location.origin;
const DEFAULT_IMAGE = `${BASE_URL}/images/albayan-official-logo.png`;

function setMeta(property: string, content: string, isName = false) {
  const attr = isName ? "name" : "property";
  let el = document.querySelector(`meta[${attr}="${property}"]`) as HTMLMetaElement;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, property);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

export function useSEO({ title, description, image, type = "website", url }: SEOOptions) {
  useEffect(() => {
    const fullTitle = title.includes("مقارئ البيان") ? title : `${title} | ${SITE_NAME}`;
    const finalDesc = description || "مقارئ البيان لتعليم القرآن الكريم — برامج تعليمية لتلاوة القرآن الكريم وحفظه وإتقانه";
    const finalImage = image ? (image.startsWith("http") ? image : `${BASE_URL}${image}`) : DEFAULT_IMAGE;
    const finalUrl = new URL(url || window.location.pathname, BASE_URL).href;

    // Page title
    document.title = fullTitle;

    // Basic meta
    setMeta("description", finalDesc, true);

    // Open Graph
    setMeta("og:title", fullTitle);
    setMeta("og:description", finalDesc);
    setMeta("og:image", finalImage);
    document.querySelector('meta[property="og:image:width"]')?.remove();
    document.querySelector('meta[property="og:image:height"]')?.remove();
    setMeta("og:url", finalUrl);
    setMeta("og:type", type);
    setMeta("og:site_name", SITE_NAME);
    setMeta("og:locale", "ar_SA");
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = finalUrl;

    // Twitter Card
    setMeta("twitter:card", "summary_large_image", true);
    setMeta("twitter:title", fullTitle, true);
    setMeta("twitter:description", finalDesc, true);
    setMeta("twitter:image", finalImage, true);
    const twitterSite = document.querySelector('meta[name="twitter:site"]');
    const twitterCreator = document.querySelector('meta[name="twitter:creator"]');
    twitterSite?.remove();
    twitterCreator?.remove();

    return () => {
      document.title = SITE_NAME;
    };
  }, [title, description, image, type, url]);
}
