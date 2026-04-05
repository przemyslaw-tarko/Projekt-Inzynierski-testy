# Projekt-Inzynierski-testy
## Porownanie frameworkow Selenium / Cypress / Playwright

Projekt realizowany w ramach pracy inzynierskiej - srodowisko badawcze do porownania frameworkow E2E w architekturze kontenerowej oraz prostej integracji CI/CD.

## Cel i zakres
- Porownanie latwosci konfiguracji i uruchomienia frameworkow E2E (Selenium, Cypress, Playwright).
- Identyczne scenariusze testowe dla kazdego frameworka.
- Uruchomienie w srodowisku Docker i spojne raportowanie.
- Integracja z prostym CI/CD (GitHub Actions).

## Architektura
- **AUT**: aplikacja testowa (WordPress + DB) uruchomiona przez Docker Compose i dostepna pod `http://localhost:8080`.
- **Frameworki**: testy uruchamiane w kontenerach i komunikujace sie z AUT przez siec Docker (`http://wordpress`).
- **Raporty**: kazdy framework zapisuje wyniki do `reports/`.

## Struktura repozytorium
```
apps/bookstore/         # docker-compose dla AUT (obrazy Docker)
apps/test-bookstore/    # submodule: zrodlo aplikacji testowej (AUT)
tests/selenium/
tests/cypress/
tests/playwright/
reports/selenium/
reports/cypress/
reports/playwright/
.github/workflows/      # CI/CD
```

## Wymagania lokalne
- Git
- Docker + Docker Compose v2
- Node.js >= 20.19.0 (zalecane 22+)
- npm 11.x

## Pobranie repozytorium + submodule
AUT jest budowany z submodule `apps/test-bookstore`. Po klonowaniu repo nalezy wykonac:
```bash
git submodule update --init --recursive
```

## Uruchomienie AUT
Pierwsze uruchomienie zbuduje obrazy Dockera z katalogu `apps/test-bookstore`.
```bash
cp .env.example .env
npm install
npm run env:up
npm run env:wait
```

AUT dostepny pod:
```
http://localhost:8080
```

Jesli przegladarka przekierowuje na `http://localhost/` bez portu, wykonaj reset srodowiska:
```bash
npm run env:reset
npm run env:up
npm run env:wait
```

## Uruchomienie testow
```bash
npm run test:selenium
npm run test:cypress
npm run test:playwright
```

## Scenariusze testowe
Dla kazdego frameworka zostal przygotowany identyczny zestaw testow.
Scenariusze dostepne w pliku `test-scenario`.

## Raporty
- `reports/selenium/html`
- `reports/selenium/junit`
- `reports/cypress/junit`
- `reports/cypress/html`
- `reports/playwright/html`
- `reports/playwright/junit`

## Uruchamianie lokalnie w VS Code (Playwright)
Playwright uruchamiany z rozszerzenia VS Code dziala lokalnie (poza Dockerem),
wiec ustaw `BASE_URL` na `http://localhost:8080` w `.vscode/settings.json`:
```json
{
  "playwright.env": {
    "BASE_URL": "http://localhost:8080"
  }
}
```

## Logi
Domyslnie logi z oczekiwania na aplikacje i z Docker Compose sa wyciszone.
Aby wlaczyc pelne logi:
```bash
VERBOSE_LOGS=true
```

## Przeplyw integracji CI/CD
1. `auto-pr.yml` - tworzy PR dla kazdego branch oprocz `main`.
2. `ci.yml` - lint + testy tylko tych frameworkow, ktorych kod sie zmienil (tylko na PR).
3. `auto-merge.yml` - wlacza auto-merge po poprawnym CI.
4. `cd.yml` - publikuje obrazy testow do GHCR po merge do `main`.

CD (publikowanie obrazow) mozemy dolozyc pozniej, gdy potwierdzimy stabilne dzialanie CI.
