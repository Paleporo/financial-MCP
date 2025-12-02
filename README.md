# MCP server per monitorare ETF

Questo progetto fornisce un semplice MCP server HTTP in Node.js che legge una lista di ETF da un file di configurazione e restituisce le quotazioni correnti tramite API pubbliche (fonte: [stooq.pl](https://stooq.pl/)). Funziona in locale anche su Windows (Node.js >= 18).

## Prerequisiti
- Node.js 18 o superiore installato sul sistema Windows
- Connessione internet per interrogare le API pubbliche

## Configurazione
Il file predefinito `config/etfs.json` contiene:
```json
{
  "pollIntervalMs": 60000,
  "market": "us",
  "symbols": ["spy", "qqq", "vti"]
}
```

- `symbols`: elenco degli ETF da monitorare (ticker in minuscolo).
- `market`: suffisso di mercato usato dall'API stooq (es. `us`, `uk`, `de`).
- `pollIntervalMs`: frequenza di aggiornamento in millisecondi.

È possibile usare un percorso diverso impostando la variabile di ambiente `ETF_CONFIG`.

## Installazione
Il progetto non richiede dipendenze esterne oltre a Node.js. Se preferisci gestire l'ambiente con npm:
```bash
npm install
```
(Se il registro npm fosse protetto in azienda, assicurati di avere accesso alle dipendenze pubbliche.)

## Avvio
```bash
npm start
```
Oppure, con ricaricamento automatico (Node 18+):
```bash
npm run dev
```

Una volta avviato, il server è raggiungibile su `http://localhost:3000` (porta configurabile via variabile di ambiente `PORT`).

### Endpoint disponibili
- `GET /health` → stato del server.
- `GET /quotes` → ultime quotazioni in cache con eventuali errori per singolo ticker.

## Note sulle API
Le quotazioni sono prelevate da stooq.pl. Alcuni ticker potrebbero non essere disponibili o avere ritardo nella diffusione dei dati; eventuali errori sono riportati nel campo `errors` della risposta.

## Sviluppo
Il codice vive in `src/`:
- `configLoader.js`: lettura e validazione del file di configurazione.
- `stooqClient.js`: integrazione con l'API pubblica.
- `server.js`: server HTTP MCP e schedulazione del refresh.

Per adattare il polling o il mercato basta modificare `config/etfs.json` e riavviare il server.
