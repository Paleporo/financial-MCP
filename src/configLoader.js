import fs from "fs";
import path from "path";

const DEFAULT_CONFIG_PATH = path.join(process.cwd(), "config", "etfs.json");

export function loadConfig(customPath) {
  const configPath = customPath || process.env.ETF_CONFIG || DEFAULT_CONFIG_PATH;
  if (!fs.existsSync(configPath)) {
    throw new Error(`File di configurazione non trovato: ${configPath}`);
  }

  const raw = fs.readFileSync(configPath, "utf8");
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    throw new Error(`Configurazione JSON non valida: ${error.message}`);
  }

  const { symbols, pollIntervalMs = 60000, market = "us" } = parsed;

  if (!Array.isArray(symbols) || symbols.length === 0) {
    throw new Error("Il file di configurazione deve contenere un array 'symbols' non vuoto.");
  }

  if (typeof pollIntervalMs !== "number" || pollIntervalMs <= 0) {
    throw new Error("'pollIntervalMs' deve essere un numero maggiore di zero.");
  }

  if (typeof market !== "string" || market.length === 0) {
    throw new Error("'market' deve essere una stringa non vuota (es. 'us').");
  }

  const normalizedSymbols = symbols.map((symbol) => symbol.toLowerCase());

  return {
    symbols: normalizedSymbols,
    pollIntervalMs,
    market: market.toLowerCase(),
    configPath,
  };
}

export const DEFAULTS = {
  DEFAULT_CONFIG_PATH,
};
