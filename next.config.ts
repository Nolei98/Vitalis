import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // node-ical e googleapis são libs Node pesadas (rrule/luxon, gRPC) que não
  // devem ser empacotadas pelo Turbopack — carregadas em runtime no servidor.
  serverExternalPackages: ["node-ical", "googleapis"],
  // Silencia o aviso de múltiplos lockfiles fixando a raiz do projeto.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
