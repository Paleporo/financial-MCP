const BASE_URL = "https://stooq.pl/q/l/";

function buildUrl(symbol, market) {
  return `${BASE_URL}?s=${encodeURIComponent(symbol)}.${encodeURIComponent(market)}&f=sd2t2ohlcv&h&e=json`;
}

function parseQuote(raw) {
  const numberOrNull = (value) => {
    const num = Number(value);
    return Number.isFinite(num) ? num : null;
  };

  return {
    symbol: raw.symbol,
    date: raw.date,
    time: raw.time,
    open: numberOrNull(raw.open),
    high: numberOrNull(raw.high),
    low: numberOrNull(raw.low),
    close: numberOrNull(raw.close),
    volume: numberOrNull(raw.volume),
    currency: raw.currency || "USD",
  };
}

export async function fetchQuote(symbol, market) {
  const response = await fetch(buildUrl(symbol, market));
  if (!response.ok) {
    throw new Error(`Richiesta fallita (${response.status}): ${response.statusText}`);
  }

  const payload = await response.json();
  if (!Array.isArray(payload) || payload.length === 0) {
    throw new Error("Risposta API inattesa o vuota.");
  }

  const [entry] = payload;
  if (entry.close === "N/D") {
    throw new Error(`Quotazione non disponibile per ${symbol}.${market}`);
  }

  return parseQuote(entry);
}

export async function fetchQuotes(symbols, market) {
  const results = await Promise.allSettled(symbols.map((symbol) => fetchQuote(symbol, market)));

  const quotes = [];
  const errors = [];

  results.forEach((result, index) => {
    const symbol = symbols[index];
    if (result.status === "fulfilled") {
      quotes.push(result.value);
    } else {
      errors.push({ symbol, message: result.reason.message });
    }
  });

  return { quotes, errors };
}
