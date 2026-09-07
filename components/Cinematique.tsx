"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { IMAGES_PAR_PLAN } from "@/lib/modules";

/**
 * Pilotage de la cinématique — le SEUL composant client de l'accueil.
 *
 * Il ne rend rien : le balisage vient du serveur (`app/page.tsx`), ce qui rend
 * les textes indexables. GSAP ne fait que l'animer par-dessus. Si ce script
 * échoue ou n'est pas exécuté, la page reste lisible.
 *
 * ⚠️ SplitText et CustomEase ont été écartés : 7 Ko gzip pour un découpage de
 * texte qui tient en vingt lignes et une courbe que `power4.out` approche à
 * l'œil nu. Budget § 4.2.
 */

const EASE = "power4.out";

/** Découpe le TEXTE d'un élément, en laissant ses enfants (le SVG du trait). */
function decouper(el: Element, mode: "mots" | "caracteres"): HTMLElement[] {
  /* Idempotent : au second passage — Strict Mode, ou retour sur la page — il
     n'y a plus de noeud texte a decouper. Sans ce garde, la fonction renvoyait
     un tableau vide et les animations devenaient muettes, sans erreur. */
  const dejaFait = el.querySelectorAll<HTMLElement>(":scope > [data-morceau]");
  if (dejaFait.length) return [...dejaFait];
  const morceaux: HTMLElement[] = [];
  [...el.childNodes].forEach((n) => {
    if (n.nodeType !== Node.TEXT_NODE) return;
    const texte = n.nodeValue ?? "";
    const frag = document.createDocumentFragment();
    const unites = mode === "mots" ? texte.split(/(\s+)/) : [...texte];
    unites.forEach((u) => {
      if (!u) return;
      if (/^\s+$/.test(u)) { frag.appendChild(document.createTextNode(u)); return; }
      const s = document.createElement("span");
      s.dataset.morceau = "";
      s.style.display = "inline-block";
      s.style.whiteSpace = "pre";
      s.textContent = u;
      frag.appendChild(s);
      morceaux.push(s);
    });
    n.parentNode?.replaceChild(frag, n);
  });
  return morceaux;
}

export function Cinematique() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const doux = matchMedia("(prefers-reduced-motion: reduce)").matches;
    /* § 1.6 : « repli en image fixe si la connexion est lente ou si
       l'économiseur de données est actif », mis en œuvre par défaut. Le
       mouvement réduit tombe dans le même repli — épingler une section et la
       faire défiler image par image est précisément ce qui gêne. */
    const co = (navigator as unknown as { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    const econome = !!co && (co.saveData === true || /2g/.test(co.effectiveType ?? ""));
    const allege = doux || econome;
    const petit = matchMedia("(max-width: 640px)").matches;
    const fin = matchMedia("(hover:hover) and (pointer:fine)").matches;
    const IMAGES = IMAGES_PAR_PLAN;

    const nettoyages: (() => void)[] = [];

    const ctx = gsap.context(() => {
      const modules = [...document.querySelectorAll<HTMLElement>(".module")];

      /* ── Rail de progression, cliquable ── */
      const pastilles = document.getElementById("pastilles");
      if (pastilles) pastilles.replaceChildren();   // remontage : on repart de zero
      const pts: HTMLElement[] = [];
      modules.forEach((_, i) => {
        const d = document.createElement("span");
        d.className = "pastille block h-1.5 w-1.5 rounded-full bg-liseret transition-colors duration-200";
        d.addEventListener("click", () => {
          const t = ScrollTrigger.getAll().filter((x) => x.pin)[i];
          if (t) window.scrollTo({ top: t.start + 40, behavior: doux ? "auto" : "smooth" });
        });
        pastilles?.appendChild(d);
        pts.push(d);
      });

      modules.forEach((sec, i) => {
        const d = sec.dataset;
        const epingle = sec.querySelector<HTMLElement>(".epingle")!;
        const scene = sec.querySelector<HTMLElement>(".scene")!;
        const toile = sec.querySelector<HTMLCanvasElement>("canvas")!;
        const ctx2d = toile.getContext("2d")!;
        const editorial = sec.querySelector<HTMLElement>(".editorial");
        const legende = sec.querySelector<HTMLElement>(".legende")!;
        const lignes = [...legende.querySelectorAll<HTMLElement>(".ligne > span")];
        const suites = [...legende.querySelectorAll<HTMLElement>(".suite")];
        const scrim = sec.querySelector<HTMLElement>(".scrim")!;
        const masque = sec.querySelector<HTMLElement>(".masque")!;
        const emplacement = sec.querySelector<HTMLElement>(".emplacement");
        const cartes = [...sec.querySelectorAll<HTMLElement>(".carte")];
        const grille = sec.querySelector<HTMLElement>(".grille");
        const garnit = sec.querySelector<HTMLElement>(".garniture");
        const oeil = sec.querySelector<HTMLElement>(".oeil");
        const regle = sec.querySelector<HTMLElement>(".regle");
        const corps = sec.querySelector<HTMLElement>(".corps");
        const indice = sec.querySelector<HTMLElement>(".indice");
        const traces = [...sec.querySelectorAll<SVGPathElement>(".trace path")];
        const grandBloc = sec.querySelector<HTMLElement>(".grand-bloc");

        /* Le titre de scène monte caractère par caractère sous le masque. */
        const cars = lignes.map((l) => decouper(l, "caracteres"));

        /* ── Images, chargées à l'approche, EN DEUX PASSES.
           121 images font 3 à 5 Mo : les demander d'un bloc laisse le plan vide
           le temps du chargement sur la 4G de Douala (§ 1.4-10). ── */
        const cache = new Array<HTMLImageElement | undefined>(IMAGES);
        let chargee = false, enAttente = false;
        const pret = (o?: HTMLImageElement) => !!o && o.complete && o.naturalWidth > 0;

        function redemanderRendu() {
          if (enAttente) return;
          enAttente = true;
          requestAnimationFrame(() => { enAttente = false; peindre(); });
        }
        function demander(k: number) {
          if (cache[k]) return;
          const o = new Image();
          o.onload = redemanderRendu;
          /* Sans ca, une image echouee reste marquee « tentee » et n'est plus
             jamais redemandee : le repli sur la voisine masque le trou. */
          o.onerror = () => { cache[k] = undefined; };
          o.src = `/sequences/${d.seq}/${String(k + 1).padStart(3, "0")}.webp`;
          cache[k] = o;
        }
        function charger() {
          if (chargee) return;
          chargee = true;
          /* Allégé : une seule image, pas de séquence. */
          if (allege) { demander(Math.floor(IMAGES / 2)); return; }
          for (let k = 0; k < IMAGES; k += 4) demander(k);
          demander(IMAGES - 1);
          const differer = window.requestIdleCallback ?? ((f: () => void) => setTimeout(f, 400));
          differer(() => { for (let k = 0; k < IMAGES; k++) demander(k); });
        }
        /* Tant que l'image exacte n'est pas là, on affiche la plus proche
           chargée : mieux vaut une image voisine qu'un panneau vide. */
        function imageDisponible(i: number) {
          if (pret(cache[i])) return cache[i]!;
          for (let e = 1; e < IMAGES; e++) {
            if (pret(cache[i - e])) return cache[i - e]!;
            if (pret(cache[i + e])) return cache[i + e]!;
          }
          return null;
        }

        let ratio = 1;
        function dimensionner(w: number, h: number) {
          const dpr = Math.min(devicePixelRatio || 1, petit ? 1.5 : 2);
          const nl = Math.max(1, Math.round(w * dpr));
          const nh = Math.max(1, Math.round(h * dpr));
          if (nl !== toile.width || nh !== toile.height) { toile.width = nl; toile.height = nh; }
          ratio = dpr;
        }
        function cadre(img: HTMLImageElement): [number, number, number, number] {
          const L = toile.width, H = toile.height;
          const e = Math.max(L / img.naturalWidth, H / img.naturalHeight);
          return [(L - img.naturalWidth * e) / 2, (H - img.naturalHeight * e) / 2,
                  img.naturalWidth * e, img.naturalHeight * e];
        }

        const suivi = { image: 0, rideau: 0, mosaique: 0 };

        /* Le plan arrive par bandes alternées — module 1. */
        function peindreRideau(img: HTMLImageElement) {
          const L = toile.width, H = toile.height, N = petit ? 6 : 10, r = cadre(img);
          for (let k = 0; k < N; k++) {
            const p = gsap.utils.clamp(0, 1, suivi.rideau * 1.95 - (k / N) * 0.95);
            if (p <= 0) continue;
            const bh = H * (1 - Math.pow(1 - p, 3));
            ctx2d.save(); ctx2d.beginPath();
            ctx2d.rect(k * L / N, k % 2 ? H - bh : 0, L / N + 1, bh); ctx2d.clip();
            ctx2d.drawImage(img, r[0], r[1], r[2], r[3]);
            ctx2d.restore();
          }
        }
        /* Le plan s'assemble depuis le centre — module 6. */
        function peindreMosaique(img: HTMLImageElement) {
          const L = toile.width, H = toile.height;
          const C = petit ? 5 : 9, R = petit ? 4 : 5, r = cadre(img);
          const cx = (C - 1) / 2, cy = (R - 1) / 2, dmax = Math.hypot(cx, cy);
          for (let j = 0; j < R; j++) for (let k = 0; k < C; k++) {
            const p = gsap.utils.clamp(0, 1, suivi.mosaique * 2 - (Math.hypot(k - cx, j - cy) / dmax));
            if (p <= 0) continue;
            const e = 1 - Math.pow(1 - p, 3);
            const tl = L / C, th = H / R, mx = tl * (1 - e) / 2, my = th * (1 - e) / 2;
            ctx2d.save(); ctx2d.beginPath();
            ctx2d.rect(k * tl + mx, j * th + my, tl - mx * 2 + 1, th - my * 2 + 1); ctx2d.clip();
            ctx2d.globalAlpha = e;
            ctx2d.drawImage(img, r[0], r[1], r[2], r[3]);
            ctx2d.restore();
          }
          ctx2d.globalAlpha = 1;
        }

        function peindre() {
          if (!toile.width) return;
          /* Fond papier, jamais noir : tout instant où l'image n'est pas encore
             peinte reste dans la page. */
          ctx2d.fillStyle = "#F6F5F2";
          ctx2d.fillRect(0, 0, toile.width, toile.height);
          const idx = Math.max(0, Math.min(IMAGES - 1, Math.round(suivi.image * (IMAGES - 1))));
          const img = imageDisponible(idx);
          if (!img) return;
          if (d.entree === "rideau" && suivi.rideau < 0.999) return peindreRideau(img);
          if (d.mosaique && suivi.mosaique < 0.999) return peindreMosaique(img);
          const r = cadre(img);
          ctx2d.drawImage(img, r[0], r[1], r[2], r[3]);
        }

        /* Boîte de mise en page, EN IGNORANT les transformations :
           `getBoundingClientRect` inclut celles de l'entrée des cartes. */
        function boite(el: HTMLElement) {
          let x = 0, y = 0;
          let n: HTMLElement | null = el;
          while (n && n !== epingle) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent as HTMLElement | null; }
          return { left: x, top: y, width: el.offsetWidth, height: el.offsetHeight };
        }

        let depart: ReturnType<typeof boite> | null = null;
        let arrivee: ReturnType<typeof boite> | null = null;
        function mesurer() {
          const mh = petit ? 10 : 26, mt = petit ? 72 : 78, mb = petit ? 10 : 26;
          arrivee = { top: mt, left: mh, width: epingle.clientWidth - mh * 2,
                      height: epingle.clientHeight - mt - mb };
          depart = emplacement ? boite(emplacement) : arrivee;
        }
        function placer(p: number) {
          const a = depart!, b = arrivee!;
          const w = a.width + (b.width - a.width) * p;
          const h = a.height + (b.height - a.height) * p;
          gsap.set(scene, { top: a.top + (b.top - a.top) * p, left: a.left + (b.left - a.left) * p,
                            width: w, height: h, borderRadius: 6 });
          dimensionner(w, h);
        }
        function reposer() { mesurer(); placer(emplacement ? 0 : 1); peindre(); }

        /* La course : 121 images sur ~1 670 px, soit une image tous les 14 px. */
        const duree = editorial ? 320 : 240;

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sec, start: "top top", end: allege ? "+=1" : "+=" + duree + "%",
            pin: !allege && epingle, scrub: allege ? false : 0.6, anticipatePin: 1,
            onEnter: charger, onEnterBack: charger, onRefresh: reposer,
            onUpdate: () => {
              pts.forEach((x, k) => {
                x.classList.toggle("bg-accent", k === i);
                x.classList.toggle("bg-liseret", k !== i);
              });
            },
          },
        });

        /* ═══ A. Le bloc de lecture — joué d'un trait à l'entrée ═══
           Asservi au défilement, chaque étape attendait un cran de molette :
           saccadé, et la page devenait interminable (§ 5.14). */
        let t0 = 0.15;
        if (editorial) {
          gsap.set(masque, { opacity: d.entree === "carte" ? 0 : 1 });
          if (d.entree === "carte") gsap.set(scene, { zIndex: 3 });

          const intro = gsap.timeline({ paused: true });
          const lgn = grandBloc ? [...grandBloc.querySelectorAll<HTMLElement>(".ligne > span")] : [];

          intro.from(regle, { scaleX: 0, duration: 0.5, ease: EASE }, 0)
               .from(oeil, { opacity: 0, x: -12, duration: 0.5, ease: EASE }, 0);

          if (d.titre === "lignes") {
            intro.from(lgn, { xPercent: (k: number) => (k % 2 ? 55 : -55), opacity: 0,
                              duration: 0.85, stagger: 0.13, ease: EASE }, 0.1);
          } else if (d.titre === "bascule") {
            const ch = lgn.flatMap((s) => decouper(s, "caracteres"));
            gsap.set(lgn, { perspective: 600 });
            intro.from(ch, { rotationX: -92, opacity: 0, transformOrigin: "50% 0%",
                             duration: 0.7, stagger: 0.022, ease: EASE }, 0.1);
          } else if (d.titre === "bande") {
            lgn.forEach((s) => {
              s.style.position = "relative";
              const b = document.createElement("span");
              b.className = "bande-rev";
              b.style.cssText = "position:absolute;inset:-2% -1%;background:#C8102E;transform-origin:left center;";
              s.appendChild(b);
            });
            const bandes = [...grandBloc!.querySelectorAll<HTMLElement>(".bande-rev")];
            gsap.set(lgn, { clipPath: "inset(0 100% 0 0)" });
            intro.to(lgn, { clipPath: "inset(0 0% 0 0)", duration: 0.75, stagger: 0.16, ease: EASE }, 0.15)
                 .fromTo(bandes, { scaleX: 0, transformOrigin: "left center" },
                         { scaleX: 1, duration: 0.38, stagger: 0.16, ease: "power2.in" }, 0.15)
                 .to(bandes, { scaleX: 0, transformOrigin: "right center",
                               duration: 0.42, stagger: 0.16, ease: "power2.out" }, 0.53);
          } else if (d.titre === "eclat") {
            const ch = lgn.flatMap((s) => decouper(s, "caracteres"));
            intro.from(ch, { opacity: 0, scale: 0.4, y: () => gsap.utils.random(-40, 40),
                             rotation: () => gsap.utils.random(-25, 25),
                             duration: 0.75, stagger: { each: 0.018, from: "random" }, ease: EASE }, 0.1);
          } else {
            const mots = lgn.flatMap((s) => decouper(s, "mots"));
            gsap.set(mots, { opacity: 0.18 });
            intro.to(mots, { opacity: 1, duration: 0.9, stagger: 0.09, ease: "none" }, 0.15);
          }

          /* Deux passes, et `pathLength="1"` : plus besoin de `getTotalLength()`,
             qui renvoie 0 tant que le SVG n'est pas mis en page. */
          if (traces.length) {
            gsap.set(traces, { strokeDashoffset: 1 });
            intro.to(traces, { strokeDashoffset: 0, duration: 0.6, ease: "power2.inOut" }, 0.95);
          }
          intro.from(corps, { opacity: 0, y: 18, duration: 0.6, ease: EASE }, 0.5)
               .from(indice, { opacity: 0, y: 10, duration: 0.4, ease: EASE }, 0.9);

          if (d.cartes === "lateral")
            intro.fromTo(cartes, { opacity: 0, xPercent: 38 },
              { opacity: 1, xPercent: 0, duration: 0.8, stagger: { each: 0.13, from: "end" }, ease: EASE }, 0.3);
          else if (d.cartes === "bascule") {
            gsap.set(grille, { perspective: 900 });
            intro.fromTo(cartes, { opacity: 0, rotateX: 74, transformOrigin: "50% 100%" },
              { opacity: 1, rotateX: 0, duration: 0.8, stagger: 0.12, ease: EASE }, 0.3);
          } else if (d.cartes === "noyau")
            intro.fromTo(cartes, { opacity: 0, scale: 0.55, filter: "blur(14px)" },
              { opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.85,
                stagger: { each: 0.14, from: "center" }, ease: EASE }, 0.3);
          else if (d.cartes === "volet")
            intro.fromTo(cartes, { clipPath: "inset(100% 0% 0% 0%)", opacity: 1 },
              { clipPath: "inset(0% 0% 0% 0%)", duration: 0.85, stagger: 0.14, ease: EASE }, 0.3);
          else
            intro.fromTo(cartes, { opacity: 0, y: 44, rotateX: -10, clipPath: "inset(0% 0% 100% 0%)" },
              { opacity: 1, y: 0, rotateX: 0, clipPath: "inset(0% 0% 0% 0%)",
                duration: 0.75, stagger: 0.12, ease: EASE }, 0.3);

          monterGarniture(intro, d.pose === "gauche" ? 0.05 : 1.15);

          ScrollTrigger.create({
            trigger: sec, start: "top 72%", once: true,
            onEnter: () => intro.play(),
            /* Rechargée déjà défilée, la section ne franchit jamais son entrée :
               le bloc resterait invisible, `intro` ayant posé ses états de départ. */
            onRefresh: (self) => { if (self.progress > 0) intro.play(); },
          });
          t0 = 0.35;
        }

        /* ═══ B. L'ouverture — un mécanisme différent par module ═══ */
        const lames: HTMLElement[] = [];
        if (editorial) {
          masque.replaceChildren();
          const N = { ecart: 2, souleve: 1, lamelles: petit ? 5 : 8, balayage: 1 }[d.entree as string] ?? 0;
          for (let k = 0; k < N; k++) {
            const l = document.createElement("span");
            l.className = "lame";
            if (d.entree === "ecart") { l.style.left = k * 50 + "%"; l.style.width = "50.5%"; }
            else if (d.entree === "lamelles") { l.style.left = (k * 100) / N + "%"; l.style.width = 100 / N + 0.4 + "%"; }
            else if (d.entree === "balayage") { l.style.left = "-30%"; l.style.width = "160%"; l.style.transform = "skewX(-12deg)"; }
            else { l.style.left = "0"; l.style.width = "100%"; }
            masque.appendChild(l); lames.push(l);
          }

          const partants = [oeil, corps, indice, grandBloc, garnit].filter(Boolean) as HTMLElement[];
          if (d.entree === "carte") {
            const ouverture = { p: 0 };
            tl.to(ouverture, { p: 1, duration: 1, ease: "power2.inOut",
                               onUpdate: () => { placer(ouverture.p); peindre(); } }, t0)
              /* `fromTo` + `immediateRender:false` : la timeline scrubbée se rend en
                 position 0 dès sa construction, où `intro` a posé l'opacité 0. */
              .fromTo(cartes.filter((c) => !c.querySelector(".emplacement")),
                      { opacity: 1, scale: 1, y: 0 },
                      { opacity: 0, scale: 0.9, y: 24, duration: 0.55, stagger: 0.06,
                        ease: "power2.in", immediateRender: false }, t0)
              .fromTo(partants, { opacity: 1, y: 0 },
                      { opacity: 0, y: -22, duration: 0.5, stagger: 0.05,
                        ease: "power2.in", immediateRender: false }, t0);
          } else {
            tl.fromTo(partants, { opacity: 1, y: 0 },
                      { opacity: 0, y: -22, duration: 0.5, stagger: 0.05,
                        ease: "power2.in", immediateRender: false }, t0)
              .fromTo(cartes, { opacity: 1, y: 0, scale: 1 },
                      { opacity: 0, y: -30, scale: 0.94, duration: 0.5, stagger: 0.05,
                        ease: "power2.in", immediateRender: false }, t0);
            if (d.entree === "ecart")
              tl.to(lames, { xPercent: (k: number) => (k === 0 ? -101 : 101), duration: 1, ease: "power3.inOut" }, t0 + 0.35);
            else if (d.entree === "souleve")
              tl.to(lames, { yPercent: -101, duration: 1, ease: "power3.inOut" }, t0 + 0.35);
            else if (d.entree === "lamelles")
              tl.to(lames, { yPercent: -101, duration: 0.85, stagger: 0.07, ease: "power3.inOut" }, t0 + 0.35);
            else if (d.entree === "balayage")
              tl.to(lames, { xPercent: -130, duration: 1, ease: "power3.inOut" }, t0 + 0.35);
            t0 += 1;
          }
        }

        /* ═══ C. Le plan se joue ═══ */
        if (d.mosaique) tl.to(suivi, { mosaique: 1, duration: 1, ease: "power2.out", onUpdate: peindre }, t0);

        /* Le hero ne s'anime pas au défilement : à l'arrivée sur la page rien n'a
           bougé, et le visiteur verrait un panneau vide sans titre. */
        if (allege) gsap.set(legende, { opacity: 1 });
        if (!d.hero && !allege) {
          tl.to(legende, { opacity: 1, duration: 0.3 }, t0 - 0.15);
          cars.forEach((groupe, k) =>
            tl.from(groupe, { yPercent: 118, duration: 0.5, stagger: 0.012, ease: EASE }, t0 - 0.1 + k * 0.09));
          if (suites.length) tl.from(suites, { opacity: 0, y: 16, duration: 0.45, stagger: 0.08, ease: EASE }, t0 + 0.4);
        }

        tl.to(suivi, { image: 1, duration: 2, ease: "none", onUpdate: peindre }, t0);

        /* Bande de pointures cliquable — module 3. */
        const bande = sec.querySelector<HTMLElement>(".bande-pointures");
        const tailles: HTMLElement[] = [];
        if (bande) {
          bande.replaceChildren();
          for (let n = 38; n <= 46; n++) {
            /* La bande est décorative : elle défile hors cadre au scrub, et
               tabuler dedans amènerait le focus sur un lien invisible. Le lien
               réellement atteignable est celui posé à côté de l'invite. */
            const s = document.createElement("a");
            s.setAttribute("tabindex", "-1");
            s.setAttribute("aria-hidden", "true");
            s.href = "/boutique?pointure=" + n;
            s.className = "titre text-4xl text-surSombre/25 transition-colors duration-150 hover:text-accent sm:text-7xl";
            s.textContent = String(n);
            bande.appendChild(s); tailles.push(s);
          }
          tl.fromTo(bande, { xPercent: 8 }, { xPercent: -38, duration: 2, ease: "none",
            onUpdate: () => {
              /* Toutes les lectures d'abord, toutes les écritures ensuite :
                 alterner fait recalculer la mise en page neuf fois par frame. */
              const m = innerWidth / 2;
              const actifs = tailles.map((s) => {
                const r = s.getBoundingClientRect();
                return Math.abs(r.left + r.width / 2 - m) < r.width * 0.8;
              });
              tailles.forEach((s, k) => {
                s.classList.toggle("text-accent", actifs[k]);
                s.classList.toggle("text-surSombre/25", !actifs[k]);
              });
            } }, t0);
        }

        /* Le message WhatsApp se frappe — module 8. */
        const frappes = [...sec.querySelectorAll<HTMLElement>(".frappe")];
        const msgs = [...sec.querySelectorAll<HTMLElement>(".msg")];
        if (frappes.length) {
          const textes = frappes.map((f) => f.textContent ?? "");
          frappes.forEach((f) => (f.textContent = ""));
          msgs.forEach((m, k) => tl.to(m, { opacity: 1, duration: 0.25 }, t0 + 0.5 + k * 0.42));
          frappes.forEach((f, k) => {
            const cible = { n: 0 };
            tl.to(cible, { n: textes[k].length, duration: 0.55, ease: "none",
              onUpdate: () => { f.textContent = textes[k].slice(0, Math.round(cible.n)); } },
              t0 + 0.55 + k * 0.42);
          });
        }

        /* Le fondu de sortie se termine avec la séquence : au-delà, la course
           restante afficherait une image figée. */
        if (!d.hero) tl.to(legende, { opacity: 0, duration: 0.5 }, t0 + 1.6);

        /* ── Garnitures : un système de mouvement par module ── */
        function monterGarniture(ligne: gsap.core.Timeline, quand: number) {
          const g = d.garniture;
          if (!g) return;

          if (g === "regle") {
            const ticks = sec.querySelector<HTMLElement>(".ticks")!;
            const etiq = sec.querySelector<HTMLElement>(".tailles")!;
            ticks.replaceChildren(); etiq.replaceChildren();
            const barres: HTMLElement[] = [];
            const etiquettes: HTMLElement[] = [];
            for (let n = 38; n <= 46; n++) {
              for (let s = 0; s < (n < 46 ? 4 : 1); s++) {
                const b = document.createElement("span");
                const majeur = s === 0;
                b.className = "tick" + (majeur ? " majeur" : "");
                b.style.height = majeur ? "28px" : "13px";
                ticks.appendChild(b); barres.push(b);
              }
              /* Styles en ligne : les classes utilitaires générées à la
                 compilation ne couvrent pas les nœuds créés à l'exécution. */
              const e = document.createElement("span");
              e.textContent = String(n);
              e.style.cssText = "position:absolute;transform:translateX(-50%);left:" + ((n - 38) / 8) * 100 + "%";
              etiq.appendChild(e); etiquettes.push(e);
            }
            const curseur = sec.querySelector<HTMLElement>(".curseur-regle")!;
            gsap.set(curseur, { left: "0%", opacity: 0 });
            ligne.from(sec.querySelector(".axe"), { scaleX: 0, duration: 0.7, ease: EASE }, quand)
                 .from(barres, { scaleY: 0, duration: 0.4, stagger: 0.006, ease: EASE }, quand + 0.15)
                 .from(etiquettes, { opacity: 0, y: 10, duration: 0.4, stagger: 0.05, ease: EASE }, quand + 0.35)
                 .to(curseur, { opacity: 1, duration: 0.25 }, quand + 0.75)
                 .to(curseur, { left: "62.5%", duration: 0.9, ease: EASE }, quand + 0.8)
                 .from(sec.querySelector(".legende-regle"), { opacity: 0, y: 8, duration: 0.4, ease: EASE }, quand + 1.2);
          }

          if (g === "compteur") {
            const chiffre = sec.querySelector<HTMLElement>(".chiffre")!;
            const zone = sec.querySelector<HTMLElement>(".barres")!;
            zone.replaceChildren();
            const hauteurs = [34, 52, 41, 66, 48, 72, 58, 72];
            const barres = hauteurs.map((h, k) => {
              const b = document.createElement("span");
              b.className = "barre" + (k >= hauteurs.length - 2 ? " vive" : "");
              b.style.height = h + "px";
              zone.appendChild(b); return b;
            });
            const compte = { n: 0 };
            ligne.to(compte, { n: 10, duration: 1.1, ease: "power2.out",
                     onUpdate: () => { chiffre.textContent = String(Math.round(compte.n)); } }, quand)
                 .from(barres, { scaleY: 0, opacity: 0, duration: 0.5, stagger: 0.07, ease: EASE }, quand + 0.2);
          }

          if (g === "familles") {
            const tuiles = [...sec.querySelectorAll<HTMLElement>(".famille")];
            const traits = [...sec.querySelectorAll<SVGPathElement>(".famille .icone path")];
            traits.forEach((p) => {
              const lg = p.getTotalLength();
              gsap.set(p, { strokeDasharray: lg, strokeDashoffset: lg });
            });
            ligne.fromTo(tuiles, { opacity: 0, rotateY: -72, transformOrigin: "left center" },
                         { opacity: 1, rotateY: 0, duration: 0.7, stagger: 0.11, ease: EASE }, quand)
                 .to(traits, { strokeDashoffset: 0, duration: 0.8, stagger: 0.11, ease: "power2.inOut" }, quand + 0.2);
          }

          if (g === "etapes") {
            const champ = sec.querySelector<HTMLElement>(".champ")!;
            champ.replaceChildren();
            const COLS = petit ? 12 : 26, RANGS = 3;
            champ.style.gridTemplateColumns = `repeat(${COLS},1fr)`;
            champ.style.gridTemplateRows = `repeat(${RANGS},1fr)`;
            const aiguilles: HTMLElement[] = [];
            for (let k = 0; k < COLS * RANGS; k++) {
              const s = document.createElement("span");
              champ.appendChild(s); aiguilles.push(s);
            }
            if (fin && !doux) {
              /* Chaque aiguille s'oriente vers le pointeur : l'angle se lit sur
                 l'arc cosinus du rapport écart horizontal / distance. */
              const suivrePointeur = (e: PointerEvent) => {
                if (!champ.offsetParent) return;
                aiguilles.forEach((s) => {
                  const r = s.getBoundingClientRect();
                  const b = e.clientX - (r.x + r.width / 2);
                  const a = e.clientY - (r.y + r.height / 2);
                  const c = Math.hypot(a, b) || 1;
                  const rot = (Math.acos(b / c) * 180) / Math.PI * (e.clientY > r.y + r.height / 2 ? 1 : -1);
                  s.style.setProperty("--rot", rot + "deg");
                });
              };
              addEventListener("pointermove", suivrePointeur, { passive: true });
              nettoyages.push(() => removeEventListener("pointermove", suivrePointeur));
            }
            const liaison = sec.querySelector<SVGPathElement>(".liaison path");
            if (liaison) {
              const lg = liaison.getTotalLength();
              gsap.set(liaison, { strokeDasharray: lg, strokeDashoffset: lg });
              ligne.to(liaison, { strokeDashoffset: 0, duration: 1, ease: "power2.inOut" }, quand + 0.25);
            }
            ligne.from(aiguilles, { opacity: 0, scaleY: 0, duration: 0.5,
                                    stagger: { each: 0.004, from: "center" }, ease: EASE }, quand)
                 .from(sec.querySelectorAll(".etape"), { opacity: 0, y: 26, duration: 0.6, stagger: 0.14, ease: EASE }, quand + 0.15)
                 .from(sec.querySelectorAll(".pastille-etape"), { scale: 0, duration: 0.5, stagger: 0.14, ease: "back.out(2)" }, quand + 0.2);
          }
        }

        reposer();
        if (i < 2) charger();

        /* L'ouverture de la page : le rideau se lève et le titre monte, une
           seule fois, dès que la première image est là. */
        if (d.hero) {
          /* 🔴 Le TEXTE ne dépend de rien. Il dépendait du chargement de la
             première image : `demander()` pose `o.onload`, et on l'écrasait
             juste après par le lanceur du hero. Si l'image finissait de charger
             entre les deux — cas courant quand elle vient du cache — le nouveau
             handler n'était jamais appelé et le titre restait invisible. Course,
             donc intermittent. Le titre s'affiche maintenant sans condition. */
          gsap.set(legende, { opacity: 1 });
          cars.forEach((groupe, k) =>
            gsap.from(groupe, { yPercent: 118, duration: 0.65, stagger: 0.014, ease: EASE, delay: 0.3 + k * 0.11 }));
          if (suites.length)
            gsap.from(suites, { opacity: 0, y: 18, duration: 0.5, stagger: 0.09, ease: EASE, delay: 0.85 });

          /* Le rideau, lui, attend l'image — mais se lève quand même si elle
             tarde : un panneau vide vaut mieux qu'un rideau qui ne s'ouvre pas. */
          let levee = false;
          const leverRideau = () => {
            if (levee) return;
            levee = true;
            gsap.to(suivi, { rideau: 1, duration: 1.15, ease: "power2.out", onUpdate: peindre });
          };
          const prem = cache[0];
          if (pret(prem)) leverRideau();
          else {
            const secours = setTimeout(leverRideau, 1500);
            /* `addEventListener` et non `onload` : on n'écrase pas le handler
               déjà posé par `demander()`. */
            prem?.addEventListener("load", () => { clearTimeout(secours); leverRideau(); }, { once: true });
            nettoyages.push(() => clearTimeout(secours));
          }
        }
      });

      /* Progression globale */
      const rail = document.getElementById("rail");
      ScrollTrigger.create({
        trigger: document.body, start: "top top", end: "bottom bottom",
        onUpdate: (self) => { if (rail) rail.style.transform = `scaleY(${self.progress})`; },
      });
    });

    const surRedimension = () => ScrollTrigger.refresh();
    addEventListener("resize", surRedimension, { passive: true });
    ScrollTrigger.refresh();

    return () => {
      removeEventListener("resize", surRedimension);
      nettoyages.forEach((f) => f());
      ctx.revert();
    };
  }, []);

  return null;
}
