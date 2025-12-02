import http from "http";
import { loadConfig } from "./configLoader.js";
import { fetchQuotes } from "./stooqClient.js";

const PORT = process.env.PORT || 3000;

class QuoteService {
  constructor(config) {
    this.config = config;
    this.cache = { quotes: [], errors: [], timestamp: null };
  }

  async refresh() {
    const { symbols, market } = this.config;
    const { quotes, errors } = await fetchQuotes(symbols, market);
    this.cache = {
      quotes,
      errors,
      timestamp: new Date().toISOString(),
    };
    return this.cache;
  }

  getSnapshot() {
    return this.cache;
  }
}

function createServer(service) {
  return http.createServer(async (req, res) => {
    res.setHeader("Content-Type", "application/json; charset=utf-8");

    if (req.url === "/health") {
      res.writeHead(200);
      res.end(JSON.stringify({ status: "ok" }));
      return;
    }

    if (req.url === "/quotes") {
      try {
        const snapshot = service.getSnapshot();
        res.writeHead(200);
        res.end(JSON.stringify(snapshot, null, 2));
      } catch (error) {
        res.writeHead(500);
        res.end(JSON.stringify({ error: error.message }));
      }
      return;
    }

    res.writeHead(404);
    res.end(JSON.stringify({ error: "Not found" }));
  });
}

async function main() {
  const config = loadConfig();
  const service = new QuoteService(config);

  // Primo caricamento immediato
  await service.refresh();

  // Aggiornamento periodico basato sulla configurazione
  setInterval(() => {
    service
      .refresh()
      .catch((error) => console.error(`Errore nel refresh delle quotazioni: ${error.message}`));
  }, config.pollIntervalMs);

  const server = createServer(service);
  server.listen(PORT, () => {
    console.log(`Server MCP attivo su http://localhost:${PORT}`);
    console.log(`Configurazione caricata da: ${config.configPath}`);
    console.log(`Tickers monitorati: ${config.symbols.join(", ")} (mercato: ${config.market})`);
    console.log(`Aggiornamento ogni ${config.pollIntervalMs} ms`);
  });
}

main().catch((error) => {
  console.error(`Impossibile avviare il server: ${error.message}`);
  process.exit(1);
});
