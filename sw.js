// Cambia el número de versión cada vez que cambies fotos o textos.
const V = "lima-coast-v1";
const FILES = [
  "./", "index.html",
  "assets/lineasanjuanchorrillos.webp", "assets/Chile_Chorrillos.webp", "assets/Batalla_de_Chorrillos.webp",
  "assets/morrosolarhoy.webp", "assets/clubregatas2.webp", "assets/herradura1910.webp",
  "assets/playalaherradura2.webp", "assets/costadechorrillos.webp", "assets/lacostaverdegreenpatches.webp",
  "assets/aramburu&thegreenpatches.webp", "assets/costaverde60s.webp", "assets/costaverde70s.webp",
  "assets/costaverdeayervshoy.webp", "assets/callaowalls.webp", "assets/Realfelipemap.webp",
  "assets/cantolao1910.webp"
];

self.addEventListener("install", e => {
  // Si una foto falta, no se cancela todo: se guardan las demás.
  e.waitUntil(
    caches.open(V)
      .then(c => Promise.all(FILES.map(f => c.add(f).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== V).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;

  // Página: primero internet (para recibir cambios), y si no hay señal, la guardada.
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req).then(r => { caches.open(V).then(c => c.put(req, r.clone())); return r; })
        .catch(() => caches.match(req).then(r => r || caches.match("index.html")))
    );
    return;
  }

  // Fotos y demás: primero lo guardado, así cargan al instante.
  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(r => {
      if (r.ok) caches.open(V).then(c => c.put(req, r.clone()));
      return r;
    }))
  );
});
