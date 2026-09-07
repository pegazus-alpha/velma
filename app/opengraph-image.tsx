import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { config } from "@/lib/config";

/**
 * La vignette de partage — § 4.3.
 *
 * Elle compte plus ici qu'ailleurs : l'entonnoir de VELMA passe par WhatsApp et
 * Instagram (§ 2.1), où un lien s'affiche d'abord comme une image.
 *
 * ⚠️ **Le titre n'est pas en Anton.** `ImageResponse` a besoin du fichier de
 * police, et `next/font/google` ne l'expose que sous un nom haché dans `.next`.
 * Plutôt que de dépendre d'un nom de fichier instable ou d'un appel réseau au
 * build, la marque est portée par le **logo** — une image, donc fidèle — et la
 * ligne de texte par la police par défaut. Écart assumé, à revoir si le client
 * fournit un fichier Anton.
 */

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${config.nom} — baskets et sneakers à Douala`;

/** Les couleurs du § 3.2, en dur : `ImageResponse` ne lit pas la feuille de style. */
const PAPIER = "#F6F5F2";
const ENCRE = "#14161A";
const ACCENT = "#C8102E";
const NEUTRE = "#58595B";

function enBase64(chemin: string): string {
  const donnees = readFileSync(join(process.cwd(), "public", chemin));
  return `data:image/png;base64,${donnees.toString("base64")}`;
}

export default async function Image() {
  const marque = enBase64("logo-marque.png");
  const mot = enBase64("logo-mot.png");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: PAPIER,
          padding: "72px 80px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={marque} width={176} height={100} alt="" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={mot} width={272} height={50} alt="" />
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ width: 96, height: 8, background: ACCENT }} />
          <span
            style={{
              marginTop: 34,
              fontSize: 62,
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              color: ENCRE,
            }}
          >
            Baskets et sneakers à Douala
          </span>
          <span style={{ marginTop: 22, fontSize: 34, color: NEUTRE }}>
            Du 38 au 46 · On parle prix sur WhatsApp
          </span>
        </div>
      </div>
    ),
    size,
  );
}
