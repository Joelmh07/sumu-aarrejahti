# Löytöretki · Itämeren sumu-aarrejahti

Softamestari 2026 -esikarsinnan työ, teemana **Löytöretki**.

Saaristo on kadonnut meri-sumun alle. Pelaaja klikkaa sumua ja paljastaa OpenStreetMap-kartan pala palalta.
Sumun alta löytyy 20 kohdetta: majakoita, hylkyjä, linnoituksia, luontokohteita ja Itämeren suojelukohteita
(rehevöitymisen torjunta, John Nurmisen Säätiön työn hengessä). Jokaisessa kohteessa on tarina ja aarrevisa.

## Ominaisuudet

- **Animoitu sumu (Fog of War)**: canvas-kerros, jossa kaksi ajelehtivaa pilvikerrosta, pehmeät reunat,
  kultainen paljastusaalto ja hiiren "lyhdyn kajo". Sumu seuraa Leafletin zoom-animaatiota.
- **Taikakompassi**: osoittaa kartan keskeltä lähimpään löytämättömään kohteeseen (Kylmä → Polttaa!).
- **Kaukoputki**: paljastaa laajan alueen kerralla. Alussa 3 kpl, jokainen saavutus antaa yhden lisää.
- **Aarrevisat**: vastausvaihtoehdot sekoitetaan joka kerta, oikea vastaus antaa XP:tä.
- **Arvonimet ja tasot**: Jungmannista Amiraaliksi.
- **Lokikirja**: löydöt (klikkaa lentääksesi kohteeseen) ja 8 saavutusta.
- **Äänitehosteet** Web Audio API:lla (ei tiedostoja), konfetti, toastit, voittonäkymä.
- **Tallennus** localStorageen, peli jatkuu siitä mihin jäit.
- Toimii myös mobiilissa. Pelkkä frontend, ei backendia.

## Käynnistys

```bash
npm install
npm run dev
```

Avaa selaimessa osoite, jonka Vite tulostaa (yleensä http://localhost:5173).

Tuotantoversio: `npm run build` ja esikatselu `npm run preview`.

## Teknologiat

React 19, Vite, Tailwind CSS v4, Leaflet + React-Leaflet. Karttatiilet © OpenStreetMapin tekijät.

## Rakenne

```
src/
  App.jsx                    pelin pääkomponentti ja kartta
  hooks/useGameState.js      pelilogiikka, saavutukset, tallennus
  components/
    FogLayer.jsx             animoitu sumu canvasilla
    DiscoveryMarkers.jsx     löydettyjen kohteiden merkit
    LocationModal.jsx        kohteen tarina ja aarrevisa
    HUD.jsx                  pelaajan tila ja työkalut
    Compass.jsx              taikakompassi
    Logbook.jsx              lokikirja ja saavutukset
    Intro.jsx, Toasts.jsx, Confetti.jsx, Victory.jsx
  data/
    locations.json           20 kohdetta tarinoineen ja visoineen
    achievements.json        saavutukset
    categories.json          kategorioiden värit
  utils/geo.js, utils/sound.js
```

## Vinkki demoon

Lähtöpiste on Hangon edustalla. Kompassi osoittaa lounaaseen kohti Bengtskäriä.
Kaukoputkella saa nopeasti näyttäviä löytöjä. "Uusi retki" nollaa pelin.
