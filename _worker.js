export default {
  async fetch(request) {
    const url = new URL(request.url);
    const host = url.hostname;

    // domain utama
    if (host === "salonku.biz.id") {
      url.pathname = "/index.html";
      return fetch(url);
    }

    // ambil nama subdomain
    const subdomain = host.split(".")[0];

    // arahkan ke folder client
    url.pathname = `/clients/${subdomain}/index.html`;

    return fetch(url);
  }
};
