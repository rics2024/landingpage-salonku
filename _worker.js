export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const host = url.hostname;

    const apexHosts = new Set([
      "salonku.biz.id",
      "www.salonku.biz.id",
    ]);

    // DOMAIN UTAMA
    if (apexHosts.has(host)) {
      // homepage utama
      if (url.pathname === "/" || url.pathname === "") {
        url.pathname = "/index.html";
      }

      // preview templates dan asset root harus tetap normal
      return env.ASSETS.fetch(new Request(url.toString(), request));
    }

    // SUBDOMAIN CLIENT
    const parts = host.split(".");
    const subdomain = parts[0];

    // file bersama yang harus tetap diambil dari root
    const sharedExact = new Set([
      "/style.css",
      "/script.js",
      "/favicon.ico",
    ]);

    const sharedPrefixes = [
      "/assets/",
      "/images/",
      "/templates/",
    ];

    if (
      sharedExact.has(url.pathname) ||
      sharedPrefixes.some((prefix) => url.pathname.startsWith(prefix))
    ) {
      return env.ASSETS.fetch(new Request(url.toString(), request));
    }

    // homepage subdomain -> clients/{subdomain}/index.html
    if (url.pathname === "/" || url.pathname === "/index.html") {
      const clientUrl = new URL(request.url);
      clientUrl.pathname = `/clients/${subdomain}/index.html`;

      const response = await env.ASSETS.fetch(
        new Request(clientUrl.toString(), request)
      );

      // kalau folder client belum ada, balikin ke homepage utama
      if (response.status === 404) {
        return Response.redirect("https://salonku.biz.id", 302);
      }

      return response;
    }

    // path lain di subdomain: coba ambil apa adanya
    return env.ASSETS.fetch(new Request(url.toString(), request));
  },
};
