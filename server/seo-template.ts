// The same initial HTML metadata is served to people and crawlers.
export function applySeoTemplate(template: string, seoDocument?: string, noindex = false): string {
  if (!seoDocument && !noindex) return template;
  let result = template
    .replace(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<meta\b[^>]*(?:name|property)=["'](?:description|keywords|robots|og:[^"']+|twitter:[^"']+)["'][^>]*>/gi, "")
    .replace(/<link\b[^>]*rel=["']canonical["'][^>]*>/gi, "");
  if (noindex) return result.replace("</head>", '<meta name="robots" content="noindex, nofollow" /></head>');
  const head = seoDocument!.match(/<head>([\s\S]*?)<\/head>/i)?.[1] || "";
  const metadata = head
    .replace(/<meta\b[^>]*(?:charset|name=["'](?:viewport|author|language)["'])[^>]*>/gi, "");
  result = result.replace(/<title>[\s\S]*?<\/title>/i, "");
  const fallback = seoDocument!.match(/<noscript>([\s\S]*?)<\/noscript>/i)?.[1] || "";
  return result.replace("</head>", `${metadata}</head>`)
    .replace('<div id="root"></div>', `<div id="root"></div><noscript>${fallback}</noscript>`);
}
