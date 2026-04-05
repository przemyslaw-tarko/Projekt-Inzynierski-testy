# Przypadki Testowe (implemented)

Ten plik opisuje zaimplementowane testy dla użycia i porównania frameworków.

## UI – Główne Przepływy Użytkownika  
1. `tests/playwright/tests/ui.spec.js`

### UI-01 Home page loads
- **Preconditions:** Aplikacja działa.
- **Steps:**
  1. Otwórz `/`.
- **Expected:** Tytuł strony zawiera „Test App”.

### UI-02 Shop shows product list
- **Preconditions:** Aplikacja działa.
- **Steps:**
  1. Otwórz `/shop`.
- **Expected:** Siatka produktów jest widoczna i zawiera co najmniej jeden produkt.

### UI-03 Product details show title and price
- **Preconditions:** Aplikacja działa.
- **Steps:**
  1. Otwórz `/shop`.
  2. Otwórz pierwszy produkt.
- **Expected:** Widoczny jest tytuł i cena produktu.

### UI-04 Add to cart from shop
- **Preconditions:** Aplikacja działa.
- **Steps:**
  1. Otwórz `/shop`.
  2. Kliknij „Add to cart” przy pierwszym produkcie.
  3. Otwórz `/cart`.
- **Expected:** Koszyk zawiera co najmniej jeden produkt.

### UI-05 Remove product from cart
- **Preconditions:** Aplikacja działa.
- **Steps:**
  1. Wyczyść koszyk (jeśli trzeba).
  2. Dodaj pierwszy produkt do koszyka.
  3. Otwórz `/cart` i usuń produkt.
- **Expected:** Widoczny jest pusty koszyk albo komunikat koszyka.

### UI-06 Cart persists after refresh
- **Preconditions:** Aplikacja działa.
- **Steps:**
  1. Wyczyść koszyk (jeśli trzeba).
  2. Dodaj pierwszy produkt do koszyka.
  3. Otwórz `/cart` i odśwież stronę.
- **Expected:** Koszyk nadal zawiera produkt.

### UI-07 Checkout shows Stripe validation error
- **Preconditions:** Aplikacja działa.
- **Steps:**
  1. Wyczyść koszyk (jeśli trzeba).
  2. Dodaj pierwszy produkt do koszyka.
  3. Otwórz `/checkout`.
  4. Kliknij „Place order”.
- **Expected:** Pojawia się błąd Stripe albo pole Stripe jest oznaczone jako nieprawidłowe, (wyświetlony komunikat "The card number is incomplete").

### UI-08 Search products
- **Preconditions:** Aplikacja działa.
- **Steps:**
  1. Otwórz `/shop`.
  2. Wyszukaj „astronomy”.
- **Expected:** Lista wyników zawiera produkty.

### UI-09 Sort products by price
- **Preconditions:** Aplikacja działa.
- **Steps:**
  1. Otwórz `/shop`.
  2. Wybierz sortowanie po cenie (rosnąco).
- **Expected:** Ceny produktów są widoczne.

### UI-10 Product images visible
- **Preconditions:** Aplikacja działa.
- **Steps:**
  1. Otwórz `/shop`.
- **Expected:** Widoczne są obrazy produktów.

### UI-11 404 for missing route
- **Preconditions:** Aplikacja działa.
- **Steps:**
  1. Otwórz `/this-page-should-not-exist`.
- **Expected:** Strona renderuje się (treść "Oops! That page can’t be" jest wyświetlana).

### UI-12 Mobile viewport basic layout
- **Preconditions:** Aplikacja działa.
- **Steps:**
  1. Ustaw viewport na 375×667.
  2. Otwórz `/`.
- **Expected:** Widoczny jest nagłówek (banner) oraz główna treść strony.

## API – Store (Public) 
1. `tests/playwright/tests/api.spec.js`

### API-01 List products
- **Endpoint:** `GET /wp-json/wc/store/products`
- **Expected:** Status 200, odpowiedź to tablica z co najmniej jednym produktem.

### API-02 Get product by ID
- **Endpoint:** `GET /wp-json/wc/store/products/:id`
- **Expected:** Status 200, `id` w odpowiedzi jest zgodne z żądanym produktem.

### API-03 Search products
- **Endpoint:** `GET /wp-json/wc/store/products?search=...`
- **Expected:** Status 200, tablica odpowiedzi nie jest pusta.

### API-04 Pagination respects per_page
- **Endpoint:** `GET /wp-json/wc/store/products?per_page=2&page=1`
- **Expected:** Status 200, długość tablicy odpowiedzi ≤ 2.

### API-05 Categories list
- **Endpoint:** `GET /wp-json/wc/store/products/categories`
- **Expected:** Status 200, odpowiedź to tablica.

### API-06 Category by ID
- **Endpoint:** `GET /wp-json/wc/store/products/categories/:id`
- **Expected:** Status 200, `id` w odpowiedzi jest zgodne z żądaną kategorią.

### API-07 Tags list
- **Endpoint:** `GET /wp-json/wc/store/products/tags`
- **Expected:** Status 200, odpowiedź to tablica.