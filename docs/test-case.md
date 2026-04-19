# Przypadki Testowe (implemented)

Ten plik opisuje zaimplementowane testy dla użycia i porównania frameworków.
- Selenium
- Cypress
- Playwright

## Implementacja
UI:
- `tests/playwright/tests/ui.spec.js`
- `tests/cypress/e2e/ui.cy.js`
- `tests/selenium/specs/ui.test.js`
  
API:
- `tests/playwright/tests/api.spec.js`
- `tests/cypress/e2e/api.cy.js`
- `tests/selenium/specs/api.test.js`
  
## UI – Główne Przepływy Użytkownika  

### UI-01 [C46] Home page loads
- **Preconditions:** Aplikacja działa.
- **Steps:**
  1. Otwórz `/`.
- **Expected:** Tytuł strony zawiera „Test App”.

### UI-02 [C47] Shop shows product list
- **Preconditions:** Aplikacja działa.
- **Steps:**
  1. Otwórz `/shop`.
- **Expected:** Siatka produktów jest widoczna i zawiera co najmniej jeden produkt.

### UI-03 [C48] Product details show title and price
- **Preconditions:** Aplikacja działa.
- **Steps:**
  1. Otwórz `/shop`.
  2. Otwórz pierwszy produkt.
- **Expected:** Widoczny jest tytuł i cena produktu.

### UI-04 [C49] Add to cart from shop
- **Preconditions:** Aplikacja działa.
- **Steps:**
  1. Otwórz `/shop`.
  2. Kliknij „Add to cart” przy pierwszym produkcie.
  3. Otwórz `/cart`.
- **Expected:** Koszyk zawiera co najmniej jeden produkt.

### UI-05 [C50] Remove product from cart
- **Preconditions:** Aplikacja działa.
- **Steps:**
  1. Wyczyść koszyk (jeśli trzeba).
  2. Dodaj pierwszy produkt do koszyka.
  3. Otwórz `/cart` i usuń produkt.
- **Expected:** Widoczny jest pusty koszyk albo komunikat koszyka.

### UI-06 [C51] Cart persists after refresh
- **Preconditions:** Aplikacja działa.
- **Steps:**
  1. Wyczyść koszyk (jeśli trzeba).
  2. Dodaj pierwszy produkt do koszyka.
  3. Otwórz `/cart` i odśwież stronę.
- **Expected:** Koszyk nadal zawiera produkt.

### UI-07 [C52] Checkout shows Stripe validation error
- **Preconditions:** Aplikacja działa.
- **Steps:**
  1. Wyczyść koszyk (jeśli trzeba).
  2. Dodaj pierwszy produkt do koszyka.
  3. Otwórz `/checkout`.
  4. Kliknij „Place order”.
- **Expected:** Pojawia się błąd Stripe albo pole Stripe jest oznaczone jako nieprawidłowe, (wyświetlony komunikat "The card number is incomplete").

### UI-08 [C53] Search products
- **Preconditions:** Aplikacja działa.
- **Steps:**
  1. Otwórz `/shop`.
  2. Wyszukaj „astronomy”.
- **Expected:** Lista wyników zawiera produkty.

### UI-09 [C54] Sort products by price
- **Preconditions:** Aplikacja działa.
- **Steps:**
  1. Otwórz `/shop`.
  2. Wybierz sortowanie po cenie (rosnąco).
- **Expected:** Ceny produktów są widoczne.

### UI-10 [C55] Product images visible
- **Preconditions:** Aplikacja działa.
- **Steps:**
  1. Otwórz `/shop`.
- **Expected:** Widoczne są obrazy produktów.

### UI-11 [C56] 404 for missing route
- **Preconditions:** Aplikacja działa.
- **Steps:**
  1. Otwórz `/this-page-should-not-exist`.
- **Expected:** Strona renderuje się (treść "Oops! That page can’t be" jest wyświetlana).

### UI-12 [C57] Mobile viewport basic layout
- **Preconditions:** Aplikacja działa.
- **Steps:**
  1. Ustaw viewport na 375×667.
  2. Otwórz `/`.
- **Expected:** Widoczny jest nagłówek (banner) oraz główna treść strony.

## API – Store (Public) 

### API-01 [C58] List products
- **Endpoint:** `GET /wp-json/wc/store/products`
- **Expected:** Status 200, odpowiedź to tablica z co najmniej jednym produktem.

### API-02 [C59] Get product by ID
- **Endpoint:** `GET /wp-json/wc/store/products/:id`
- **Expected:** Status 200, `id` w odpowiedzi jest zgodne z żądanym produktem.

### API-03 [C60] Search products
- **Endpoint:** `GET /wp-json/wc/store/products?search=...`
- **Expected:** Status 200, tablica odpowiedzi nie jest pusta.

### API-04 [C61] Pagination respects per_page
- **Endpoint:** `GET /wp-json/wc/store/products?per_page=2&page=1`
- **Expected:** Status 200, długość tablicy odpowiedzi <= 2.

### API-05 [C62] Categories list
- **Endpoint:** `GET /wp-json/wc/store/products/categories`
- **Expected:** Status 200, odpowiedź to tablica.

### API-06 [C63] Category by ID
- **Endpoint:** `GET /wp-json/wc/store/products/categories/:id`
- **Expected:** Status 200, `id` w odpowiedzi jest zgodne z żądaną kategorią.

### API-07 [C64] Tags list
- **Endpoint:** `GET /wp-json/wc/store/products/tags`
- **Expected:** Status 200, odpowiedź to tablica.

## Propozycje case'ow pod statusy TestRail

Te przypadki nie są klasycznym zestawem regresyjnym. Ich celem jest sprawdzenie, czy integracja Framework -> JUnit -> TestRail poprawnie raportuje statusy inne niż sam sukces.


### PW-STATUS-UI-01 Shop [C128] blocked by maintenance page
- **Framework:** Playwright UI
- **Target TestRail status:** `Blocked` albo `Skipped` (zalezne od mapowania `<skipped>`)
- **Preconditions:** Aplikacja storefront zwraca `503` albo strone maintenance dla `/shop`.
- **Steps:**
  1. Wykonaj preflight `GET /shop`.
  2. Jesli odpowiedz nie jest gotowa do testu (`503`, maintenance banner, brak glownej tresci), zakoncz test jako `skip`.
- **Expected:** Wynik ma reprezentowac brak mozliwosci wykonania testu z powodu niedostepnosci aplikacji, a nie blad logiki testu.

### PW-STATUS-UI-02 [C129] Checkout blocked by missing Stripe dependency
- **Framework:** Playwright UI
- **Target TestRail status:** `Blocked` albo `Skipped`
- **Preconditions:** Stripe gateway jest wylaczony, nie laduje sie iframe Stripe albo brakuje konfiguracji checkoutu.
- **Steps:**
  1. Dodaj produkt do koszyka.
  2. Otworz `/checkout`.
  3. Sprawdz, czy komponent Stripe jest dostepny.
  4. Jesli zaleznosc nie jest dostepna, zakoncz test jako `skip`.
- **Expected:** Test ma sygnalizowac zablokowanie przez zaleznosc zewnetrzna, a nie falszywy `fail`.

### PW-STATUS-UI-03 [C130] Add to cart count intentionally fails
- **Framework:** Playwright UI
- **Target TestRail status:** `Automation Failed`
- **Preconditions:** Aplikacja dziala poprawnie.
- **Steps:**
  1. Otworz `/shop`.
  2. Dodaj pierwszy produkt do koszyka.
  3. Odczytaj licznik lub stan koszyka.
  4. Celowo asercja oczekuje wartosci `2` po pojedynczym dodaniu produktu.
- **Expected:** Test powinien zakonczyc sie klasycznym assertion failure i trafic do statusu `Automation Failed`.

### PW-STATUS-UI-04 [C131] Search result forced failure
- **Framework:** Playwright UI
- **Target TestRail status:** `Automation Failed`
- **Preconditions:** Aplikacja dziala poprawnie.
- **Steps:**
  1. Otworz `/shop`.
  2. Wyszukaj fraze, ktora nie ma wynikow, np. `zzzz-unlikely-term`.
  3. Celowo sprawdz, ze pierwszy produkt z listy wynikow jest widoczny.
- **Expected:** Test powinien zakonczyc sie niepowodzeniem asercji, co daje czytelny sygnal `Automation Failed`.

### PW-STATUS-UI-05 [C132] Runtime error while reading product details
- **Framework:** Playwright UI
- **Target TestRail status:** `Automation Error`
- **Preconditions:** Aplikacja dziala poprawnie.
- **Steps:**
  1. Otworz `/shop`.
  2. Pobierz pierwszy produkt.
  3. Po przejsciu przez preconditions wymus runtime error w kodzie testu, np. przez odwolanie do nieistniejacej struktury danych lub jawne `throw new Error(...)`.
- **Expected:** Test powinien zakonczyc sie bledem wykonania, a nie zwykla nieudana asercja, tak aby raport trafil do `Automation Error`.

### PW-STATUS-API-01 [C133] Products endpoint blocked by unavailable backend
- **Framework:** Playwright API
- **Target TestRail status:** `Blocked` albo `Skipped`
- **Preconditions:** Backend WordPress/WooCommerce zwraca `503` dla `GET /wp-json/wc/store/products`.
- **Steps:**
  1. Wykonaj request do `GET /wp-json/wc/store/products`.
  2. Jesli backend jest niedostepny, zakoncz test jako `skip`.
- **Expected:** Test sygnalizuje brak mozliwosci wykonania z powodu niedostepnego srodowiska.

### PW-STATUS-API-02 [C134] Categories test skipped when catalog seed is absent
- **Framework:** Playwright API
- **Target TestRail status:** `Blocked` albo `Skipped`
- **Preconditions:** Srodowisko jest uruchomione, ale dane katalogowe nie zostaly zaladowane lub lista kategorii jest pusta.
- **Steps:**
  1. Wykonaj request do `GET /wp-json/wc/store/products/categories`.
  2. Jesli odpowiedz jest pusta, zakoncz test jako `skip`.
- **Expected:** Wynik ma komunikowac brak precondition danych testowych, a nie blad produktu.

### PW-STATUS-API-03 [C135] Invalid product id expected as success
- **Framework:** Playwright API
- **Target TestRail status:** `Automation Failed`
- **Preconditions:** Aplikacja dziala poprawnie.
- **Steps:**
  1. Wykonaj request do `GET /wp-json/wc/store/products/999999`.
  2. Celowo oczekuj statusu `200` i poprawnego payloadu produktu.
- **Expected:** Test powinien zakonczyc sie assertion failure, co w TestRail ma dac `Automation Failed`.

### PW-STATUS-API-04 [C136] Pagination assertion intentionally overstates result count
- **Framework:** Playwright API
- **Target TestRail status:** `Automation Failed`
- **Preconditions:** Aplikacja dziala poprawnie.
- **Steps:**
  1. Wykonaj request do `GET /wp-json/wc/store/products?per_page=2&page=1`.
  2. Celowo asercja wymaga wiecej niz 2 rekordow.
- **Expected:** Raport powinien pokazac przewidywalny assertion failure.

### PW-STATUS-API-05 [C137] Runtime error on non-JSON response parsing
- **Framework:** Playwright API
- **Target TestRail status:** `Automation Error`
- **Preconditions:** Aplikacja dziala poprawnie.
- **Steps:**
  1. Wykonaj request do endpointu HTML, np. `/cart` albo `/checkout`.
  2. Celowo potraktuj odpowiedz jako JSON.
  3. Dopuszczalne jest tez jawne rzucenie wyjatku po pozytywnym przejsciu precondition.
- **Expected:** Test powinien zakonczyc sie bledem wykonania i trafic do `Automation Error`.
