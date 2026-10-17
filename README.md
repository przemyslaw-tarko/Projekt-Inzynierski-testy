# Selenium vs Cypress vs Playwright – porównanie frameworków automatyzacji testów

![CD](https://github.com/przemyslaw-tarko/Projekt-Inzynierski-testy/actions/workflows/cd.yml/badge.svg)
![Playwright](https://img.shields.io/badge/Playwright-1.59-2EAD33?logo=playwright)
![Cypress](https://img.shields.io/badge/Cypress-15.11-17202C?logo=cypress)
![Selenium](https://img.shields.io/badge/Selenium-4.x-43B02A?logo=selenium)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)

Projekt zrealizowany w ramach pracy inżynierskiej na ZUT w Szczecinie (2026):
„Porównanie frameworków Selenium, Cypress i Playwright w automatyzacji testów aplikacji Bookstore w środowisku kontenerowym Docker”.

Obiektem testów jest aplikacja szkoleniowa [Testelka – test-bookstore](https://github.com/Testelka/test-bookstore)
(sklep WordPress + WooCommerce z celowo ukrytymi błędami), dołączona jako submoduł Git.

## Najważniejsze elementy

- 20 identycznych scenariuszy w każdym frameworku: smoke, 12 × UI, 7 × REST API
- Izolowane środowisko testowe w Docker Compose (healthchecki, oczekiwanie na gotowość serwisów)
- CI w GitHub Actions: lint, walidacja docker-compose, uruchamianie tylko zmienionego frameworka (paths-filter)
- CD: publikacja obrazów testowych do GitHub Container Registry
- Raporty HTML + JUnit XML, automatyczne przesyłanie wyników do TestRail (trcli)

## Wyniki

| Kryterium | Selenium | Cypress | Playwright |
|---|---|---|---|
| Średni czas – lokalnie (5 uruchomień) | 66,4 s | 42,2 s | **25,2 s** |
| Odchylenie standardowe | 31,0 s | 6,4 s | **3,5 s** |
| Średni czas jobu – CI (3 uruchomienia) | 139,3 s | 165,3 s | **127,0 s** |
| Złożoność konfiguracji | wysoka | średnia | **niska** |
| Raportowanie | zewnętrzne biblioteki | tylko JUnit (scalanie) | **wbudowane HTML + JUnit** |

**Wniosek:** Playwright był najszybszy i najstabilniejszy oraz wymagał najmniej konfiguracji.
Cypress – intuicyjne API, ale największa zmienność w CI. Selenium – najwięcej kodu pomocniczego
i najwyższa zmienność czasów (architektura WebDriver przez HTTP).

## Zrzuty ekranu

| Raport Playwright | Pipeline CI |
|---|---|
| ![Raport Playwright](docs/img/playwright-report.png) | ![Pipeline CI](docs/img/ci-pipeline.png) |

![Wyniki w TestRail](docs/img/testrail-runs.png)
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
