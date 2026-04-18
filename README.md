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
- npm 11.x

## Pobranie repozytorium + submodule
AUT jest budowany z submodule `apps/test-bookstore`. Po klonowaniu repo należy wykonać:
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

Jeśli wprowadzisz zmiany w testach uruchamianych w kontenerach (Selenium/Cypress/Playwright), przebuduj obrazy testowe:
```bash
npm run compose:tests:build
```

## Scenariusze testowe
Dla każdego frameworka został przygotowany zestaw testow mający na celu porównać te same akcje.
Scenariusze dostępne w pliku `docs/test-case.md`.

## Raporty
- `reports/selenium/html`
- `reports/selenium/junit`
- `reports/cypress/junit`
- `reports/playwright/html`
- `reports/playwright/junit`


## Logi
Domyślnie logi z oczekiwania na aplikacje i z Docker Compose są wyciszone.
Aby właczyć pełne logi:
```bash
VERBOSE_LOGS=true
```

## Przepływ integracji CI/CD
1. `auto-pr.yml` - tworzy PR dla każdego branch oprócz `main`.
2. `ci.yml` - lint + testy tylko tych frameworkow, których kod się zmienił (tylko na PR).
3. `auto-merge.yml` - włącza auto-merge po poprawnym CI.

CD publikuje obrazy testowe do GHCR dopiero po pomyślnym CI na branchu `main`.
