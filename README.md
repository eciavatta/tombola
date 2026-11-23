# Tombola

Tabellone e generatore di cartelle per la tombola, solo frontend (React + TypeScript + Vite + Tailwind).

```sh
npm install
npm run dev     # sviluppo
npm run build   # build di produzione in dist/
```

- **Tabellone**: 90 numeri (9 righe x 10), divisi nei 6 blocchi classici. "Estrai numero" pesca a caso; cliccando un numero lo si segna/toglie a mano.
- **Cartelle**: "Stampa cartelle" apre una finestra a schede e scarica un PDF A4. Le cartelle sono generate in serie da 6 che coprono tutti i 90 numeri (3x9, 15 numeri, 5 per riga, colonne per decina).
  - *Generale*: numero di cartelle, cartelle per pagina, linee di taglio.
  - *Cartella*: template immagine (sfondo di ogni cartella) con indicazioni sulle dimensioni consigliate, margini della griglia.
  - *Titolo*: testo con segnaposto (`{serie}`, `{cartella}`, `{numero}`, `{totale}`), posizione, allineamento, dimensione, colore, spostamento.
  - *Stile*: font, numeri, griglia, sfondo celle, cartella senza template.
  - Anteprima della pagina, esporta/importa impostazioni (template incluso) in JSON, ripristino predefiniti.
- **Serata**: nome della serata modificabile nell'header (clic sul titolo) e logo nel pannello accanto all'ultimo estratto: di default il logo Tombola (`src/assets/default-logo.webp`), sostituibile con uno proprio o nascondibile.
- **Temi**: Chiaro, Scuro, Natale, Alto contrasto, oppure Automatico (segue chiaro/scuro del sistema). I colori sono variabili CSS in `src/index.css`.
- **Schermo intero**: con il pulsante nell'header o con F11 si entra in modalità presentazione, che nasconde i controlli di configurazione (tema, logo, stampa cartelle) e lascia solo il gioco, con il tabellone ingrandito a tutta altezza.
- Numeri estratti, nome, logo, tema e impostazioni di stampa vengono salvati in localStorage.
