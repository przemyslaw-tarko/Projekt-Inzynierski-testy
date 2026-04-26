# Projekt-Inżynierski-testy
## Porównanie frameworkow Selenium / Cypress / Playwright

Projekt realizowany w ramach pracy inżynierskiej - środowisko badawcze do porównania frameworkow E2E w architekturze kontenerowej oraz prostej integracji CI/CD.

## Cel i zakres
- Porównanie łatwości konfiguracji i uruchomienia frameworkow E2E (Selenium, Cypress, Playwright).
- Identyczne scenariusze testowe dla każdego frameworka.
- Uruchomienie w środowisku Docker i spójne raportowanie.
- Integracja z prostym CI/CD (GitHub Actions).

## Architektura
- **AUT**: aplikacja testowa (WordPress + DB) uruchomiona przez Docker Compose i dostępna pod `http://localhost:8080`.
- **Frameworki**: testy uruchamiane w kontenerach i komunikujące sie z AUT przez siec Docker (`http://wordpress`).
- **Raporty**: każdy framework zapisuje wyniki do `reports/`.

## Struktura repozytorium
```
apps/bookstore/         # docker-compose dla AUT (obrazy Docker)
apps/test-bookstore/    # submodule: zrodlo aplikacji testowej (AUT)
docs/test-case.md       # scenariusze testowe
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
- npm >= 10.x

## Pobranie repozytorium + submodule
AUT jest budowany z submodule `apps/test-bookstore`. Po klonowaniu repo należy wykonać:
```bash
git submodule update --init --recursive
```

## Zmienne środowiskowe
Plik `.env.example` zawiera domyślne wartości. Skopiuj go przed pierwszym uruchomieniem:
```bash
cp .env.example .env
```

Dostępne zmienne:
- `APP_PORT` - port lokalny AUT (domyślnie `8080`)
- `TESTRAIL_ENABLED` - włącza wysyłanie wyników do TestRail (domyślnie `false`)
- `TESTRAIL_URL` - adres instancji TestRail, np. `https://projekt.testrail.io`
- `TESTRAIL_USER` - adres e-mail konta TestRail
- `TESTRAIL_API_KEY` - klucz API wygenerowany w ustawieniach konta TestRail
- `VERBOSE_LOGS` - włącza szczegółowe logi oczekiwania na aplikację i Docker Compose (domyślnie `false`)


## Uruchomienie AUT
Pierwsze uruchomienie zbuduje obrazy Dockera z katalogu `apps/test-bookstore`.
```bash
cp .env.example .env
npm install
npm run env:up
npm run env:wait
```

AUT dostępny pod:
```
http://localhost:8080
```

Jeśli przeglądarka przekierowuje na `http://localhost/` bez portu, wykonaj reset środowiska:
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

Uruchomienie testów dla wszystkich frameworków sekwencyjnie:
```bash
npm run test:all
```

Jeśli wprowadzisz zmiany w testach uruchamianych w kontenerach (Selenium/Cypress/Playwright), przebuduj obrazy testowe:
```bash
npm run compose:tests:build
```

## Scenariusze testowe
Dla każdego frameworka został przygotowany identyczny zestaw testów obejmujący:
- testy smoke - minimalna weryfikacja dostępności aplikacji,
- testy UI - główne przepływy użytkownika w interfejsie sklepu,
- testy API - publiczne endpointy WooCommerce Store REST API.

Pełna specyfikacja scenariuszy dostępna w pliku `docs/test-case.md`.

## Raporty
Po wykonaniu testów wyniki dostępne są w katalogu `reports/`:
- `reports/selenium/html` - raport HTML (Mochawesome)
- `reports/selenium/junit` - wyniki w formacie JUnit XML
- `reports/cypress/junit` - wyniki w formacie JUnit XML
- `reports/playwright/html` - interaktywny raport HTML
- `reports/playwright/junit` - wyniki w formacie JUnit XML

## Integracja z TestRail
Wyniki testów mogą być automatycznie przesyłane do TestRail po każdym uruchomieniu.

Aby włączyć integrację lokalnie, ustaw w pliku `.env`:

TESTRAIL_ENABLED=true
TESTRAIL_URL=https://twoja-instancja.testrail.io
TESTRAIL_USER=adres@email.com
TESTRAIL_API_KEY=twoj_klucz_api

W środowisku CI integracja jest kontrolowana przez sekrety repozytorium GitHub:
`TESTRAIL_ENABLED`, `TESTRAIL_URL`, `TESTRAIL_USER`, `TESTRAIL_API_KEY`.

Gdy `TESTRAIL_ENABLED=false` (wartość domyślna), wszystkie kroki związane z TestRail są pomijane - pipeline CI działa bez skonfigurowanego konta TestRail.

## Przepływ integracji CI/CD
1. `auto-pr.yml` - tworzy PR dla każdego brancha oprócz `main`.
2. `ci.yml` - lint + testy tylko tych frameworków, których kod się zmienił (tylko na PR).
3. `auto-merge.yml` - włącza auto-merge po poprawnym CI.

CD publikuje obrazy testowe do GHCR dopiero po pomyślnym CI na branchu `main`.