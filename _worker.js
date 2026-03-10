export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const host = url.hostname;

    const apexHosts = new Set([
      "salonku.biz.id",
      "www.salonku.biz.id",
    ]);

    // 1) DOMAIN UTAMA
    // - /              -> /index.html
    // - /templates/... -> biarkan jalan untuk preview
    // - /style.css     -> biarkan jalan
    // - /script.js     -> biarkan jalan
    if (apexHosts.has(host)) {
      if (url.pathname === "/" || url.pathname === "") {
        url.pathname = "/index.html";
      }

      return env.ASSETS.fetch(new Request(url.toString(), request));
    }

    // 2) SUBDOMAIN CLIENT
    // misal athaya.salonku.biz.id -> /clients/athaya/index.html
    const parts = host.split(".");
    const subdomain = parts[0];

    // shared assets harus tetap bisa diakses
    const sharedPaths = [
      "/style.css",
      "/script.js",
      "/favicon.ico",
    ];

    const sharedPrefixes = [
      "/assets/",
      "/images/",
      "/templates/",
    ];

    if (
      sharedPaths.includes(url.pathname) ||
      sharedPrefixes.some((prefix) => url.pathname.startsWith(prefix))
    ) {
      return env.ASSETS.fetch(new Request(url.toString(), request));
    }

    // homepage subdomain -> file client
    if (url.pathname === "/" || url.pathname === "/index.html") {
      const clientUrl = new URL(request.url);
      clientUrl.pathname = `/clients/${subdomain}/index.html`;

      const response = await env.ASSETS.fetch(
        new Request(clientUrl.toString(), request)
      );

      // kalau client belum ada, lempar ke homepage utama
      if (response.status === 404) {
        return Response.redirect("https://salonku.biz.id", 302);
      }

      return response;
    }

    // selain itu, coba serve apa adanya
    return env.ASSETS.fetch(new Request(url.toString(), request));
  },
};
