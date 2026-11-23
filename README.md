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
- **Immagini dei numeri**: si sceglie una cartella con immagini chiamate come il numero (`7.jpg`, `07.png`, `90.webp`, ...); quando esce quel numero (estrazione o click) l'immagine compare a tutto schermo e si chiude con un click, un tasto o dopo N secondi. Le immagini vengono copiate nel browser (IndexedDB).
- **Temi**: Chiaro, Scuro, Natale, Alto contrasto, oppure Automatico (segue chiaro/scuro del sistema). I colori sono variabili CSS in `src/index.css`.
- **Schermo intero**: con il pulsante nell'header o con F11 si entra in modalità presentazione, che nasconde i controlli di configurazione (tema, logo, stampa cartelle) e lascia solo il gioco, con il tabellone ingrandito a tutta altezza.
- Numeri estratti, nome, logo, tema e impostazioni di stampa vengono salvati in localStorage.

## Configurazione

### Google Analytics

Analytics viene incluso solo se in fase di build è definita `VITE_GA_MEASUREMENT_ID` (es. `G-XXXXXXXXXX`) e viene caricato solo dopo il consenso dell'utente (banner; "Preferenze cookie" nel footer per cambiare scelta).

- **GitHub Pages**: variabile di repository `GA_MEASUREMENT_ID` (Settings → Secrets and variables → Actions → Variables), letta dal workflow di deploy.
- **In locale**: file `.env.local` con `VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX` (non versionato).

Eventi inviati: `mark_number`, `download_cards`, `load_number_images`, `enter_fullscreen`, `change_theme`.

### SEO

URL pubblico `https://tombola.eciavatta.dev/` in `index.html` (canonical, Open Graph, JSON-LD), `public/robots.txt` e `public/sitemap.xml`: aggiornarli se il dominio cambia. Immagine di anteprima dei link: `public/og-image.png` (1200×630).
