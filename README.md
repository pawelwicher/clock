# Która godzina? — ćwiczenia z zegarem analogowym

Prosty quiz w Angularze: losowany jest zegar analogowy, a zadaniem jest wpisanie godziny
(pole „Godzina” 1–12) i minut (pole „Minuty” 0–59), a następnie sprawdzenie odpowiedzi.
Wynik (dobrze / źle / skuteczność) liczony jest wyłącznie w pamięci — odświeżenie strony
zaczyna liczenie od zera.

Poziomy trudności: pełne godziny, kwadranse, co 5 minut, dowolna minuta.

## Uruchomienie lokalne

```bash
npm install
npm start        # http://localhost:4200
npm test         # testy jednostkowe (vitest)
npm run build    # build produkcyjny do dist/clock/browser
```

## Deploy na GitHub Pages

W repozytorium jest gotowy workflow [.github/workflows/deploy.yml](.github/workflows/deploy.yml),
który po każdym pushu na gałąź `main` buduje aplikację i publikuje ją na GitHub Pages.
`--base-href` jest ustawiany automatycznie na nazwę repozytorium.

Kroki jednorazowe:

1. Wypchnij projekt do repozytorium na GitHubie (gałąź `main`).
2. W ustawieniach repo: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Push na `main` uruchomi deploy; strona będzie pod `https://<user>.github.io/<repo>/`.

Ręczny build z tym samym base href (dla repo o nazwie `clock`):

```bash
npm run build:gh
```

Jeśli repozytorium ma inną nazwę, zmień `--base-href` w skrypcie `build:gh` w `package.json`.
Plik `public/.nojekyll` pilnuje, żeby GitHub Pages nie przepuszczał builda przez Jekyll.

## Struktura

- [src/app/app.ts](src/app/app.ts) — logika quizu: losowanie godziny, walidacja odpowiedzi, wynik sesji
- [src/app/clock-face/clock-face.ts](src/app/clock-face/clock-face.ts) — tarcza zegara rysowana w SVG
- [src/styles.scss](src/styles.scss) — paleta kolorów (stonowana, z wariantem ciemnym) i style globalne
