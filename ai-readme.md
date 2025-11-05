## Technology Stack and Dependencies

### Overview
- Framework: Angular 20 (standalone components, `ApplicationConfig` providers)
- Language: TypeScript 5.9 (strict mode, strict templates)
- Runtime: Browser with Zone.js; optional SSR package present
- UI & UX: Angular CDK (DragDrop), Angular Material (snack-bar), Tailwind CSS
- Data & HTTP: Angular `HttpClient`
- Reactive: RxJS 7.8
- Testing: Karma/Jasmine (Angular builder)
- Tooling: Angular CLI/build 20, Prettier 3, Tailwind 4, TypeScript compiler

### Core Angular Packages
- `@angular/core` 20.2.1 — component model, DI, signals primitives
- `@angular/common` 20.2.1 — common directives, pipes, HTTP tokens
- `@angular/router` 20.2.1 — routing (standalone `provideRouter`)
- `@angular/forms` 20.2.1 — template-driven forms (`FormsModule` in use)
- `@angular/platform-browser` 20.2.1 — browser runtime
- `@angular/animations` 20.2.1 — animation engine (globally provided)
- `@angular/platform-server` 20.2.1 and `@angular/ssr` 20.2.1 — SSR support (installed, not configured here)

### UI and Styling
- `@angular/cdk` 20.2.0 — Drag & Drop used for list interactions
- `@angular/material` ^20.2.0 — `MatSnackBar` via a wrapper service
- `tailwindcss` 4.1.12 and `@tailwindcss/postcss` 4.1.12 — utility-first styling
- Global styles include `src/styles.css` and `src/material-theme.scss` (per `angular.json`)

### Reactive and Data
- `rxjs` 7.8.0 — Observables for HTTP results and async flows
- `@ngrx/signals` 20.0.1 — available but not used in current code
- `@tanstack/angular-query-experimental` ^5.85.5 — installed for data fetching/caching patterns; not used in current code

### Server/Runtime Utilities
- `express` 5.1.0 (with `@types/express`) — present for potential local server/SSR tasks (not wired into the app)
- `zone.js` 0.15.0 — async context tracking for Angular change detection

### Build and Dev Tooling
- `@angular/cli` 20.2.0 and `@angular/build` 20.2.0 — build system and dev server
- `@angular/compiler`/`@angular/compiler-cli` 20.2.1 — Angular compiler
- `typescript` 5.9.2 — TS compiler (strict settings in `tsconfig.json`)
- `prettier` 3.6.2 — code formatting (`npm run format.write`)
- `postcss` 8.5.6 — CSS processing pipeline (for Tailwind)

### Testing
- `@angular/build:karma` builder — unit test runner integration
- `tsconfig.spec.json` with `jasmine` types
- `@playwright/test` ^1.55.0 — end-to-end testing framework installed; no config in app yet

### Notable Configuration Files
- `angular.json` — Angular application builder and options (browser entry, styles, assets)
- `tsconfig.json` — strict TS and Angular template checks enabled
- `package.json` — scripts: `start`, `build`, `watch`, `test`, `format.write`

### In-Repo Usage Highlights
- Providers configured in `src/app/app.config.ts` with `provideRouter`, `provideHttpClient`, animations, global error listeners, and zone event coalescing.
- Feature components are standalone and import only what they need (e.g., `FormsModule`, `DragDropModule`).
- HTTP access via a typed API client (`BookApiClient`) returning `Observable<Book[]>`.

### Installed But Not Currently Used
- `@ngrx/signals` and `@tanstack/angular-query-experimental` — candidates for future state/data management improvements.
- SSR-related packages — can be enabled later for server-side rendering.

### Scripts
```json
{
  "start": "ng serve",
  "build": "ng build",
  "watch": "ng build --watch --configuration development",
  "test": "ng test",
  "format.write": "prettier --write \"src/**/*.{ts,html,md,css,json}\""
}
```

### Source References
- Providers: `src/app/app.config.ts`
- Routes: `src/app/app.routes.ts`
- Components: `src/app/books/book-list.component.ts`, `src/app/books/book-item.component.ts`
- API client and model: `src/app/books/book-api-client.service.ts`, `src/app/books/book.ts`


## Architektur

- App-Bootstrap über `ApplicationConfig` mit globalen Providern (Router, HttpClient, Animations, Error Listener, Zone Coalescing).
  
  ```7:15:src/app/app.config.ts
  export const appConfig: ApplicationConfig = {
      providers: [
          provideBrowserGlobalErrorListeners(),
          provideZoneChangeDetection({ eventCoalescing: true }),
          provideRouter(routes),
          provideHttpClient(),
          provideAnimations()
      ]
  };
  ```

- Standalone-Komponenten ohne NgModule. Root-Layout liefert Shell und `router-outlet`.
  
  ```4:12:src/app/app.ts
  @Component({
      selector: 'app-root',
      imports: [RouterOutlet],
      templateUrl: './app.html',
      styleUrl: './app.css'
  })
  export class App {}
  ```

- Feature-Struktur: `src/app/books` mit Container- und Presentational-Komponenten.
  
  ```9:16:src/app/books/book-list.component.ts
  @Component({
      selector: 'app-book-list',
      standalone: true,
      imports: [CommonModule, FormsModule, BookItemComponent, DragDropModule],
      templateUrl: './book-list.component.html'
  })
  export class BookListComponent implements OnInit {
  ```

- Routing minimalistisch, aktuell keine Lazy-Loads (kann später via `loadComponent`/`loadChildren` ergänzt werden).
  
  ```1:7:src/app/app.routes.ts
  export const routes: Routes = [
      { path: '', component: BookListComponent },
      { path: '**', redirectTo: '' }
  ];
  ```

- Datenzugriff über Service-Layer (`BookApiClient`) mit typisierten DTOs.
  
  ```6:12:src/app/books/book-api-client.service.ts
  @Injectable({ providedIn: 'root' })
  export class BookApiClient {
      private readonly apiUrl = 'http://localhost:4730/books';
      constructor(private http: HttpClient) {}
  }
  ```


## Coding Patterns

- Dependency Injection
  - Globale Provider via `ApplicationConfig`; Services via `providedIn: 'root'`.
  - Keine custom Injection Tokens aktuell (einfacher Workshop-Fokus).

- Smart vs. Presentational Components
  - Smart: `BookListComponent` orchestriert Datenfluss, Suche, DnD.
  - Presentational: `BookItemComponent` rendert UI eines Buches.

- HTTP & Fehlerbehandlung
  - Services geben `Observable<T>` zurück; Komponente subscribed und handhabt Lade-/Fehlerzustand.
  
  ```29:41:src/app/books/book-list.component.ts
  private loadBooks(search?: string): void {
      this.loading = true;
      this.bookApiClient.getBooks(this.pageSize, search).subscribe({
          next: books => { this.books = books; this.loading = false; },
          error: error => { console.error('Error fetching books:', error); this.loading = false; }
      });
  }
  ```

- Forms
  - Template-driven: `FormsModule`, `[(ngModel)]` für Suche, Debounce via `setTimeout`.
  
  ```4:12:src/app/books/book-list.component.html
  <input type="text" [(ngModel)]="searchTerm" (ngModelChange)="onSearchChange()" />
  ```

- RxJS
  - Einfache Subscriptions ohne komplexe Operator-Pipelines; Potenzial für `async` Pipe/Signals.

- Performance Patterns
  - `trackBy` in `*ngFor` zur Minimierung von DOM-Updates.
  
  ```56:58:src/app/books/book-list.component.ts
  trackById(index: number, book: Book): string { return book.id; }
  ```

  - Event Coalescing global aktiviert; Suche clientseitig gedrosselt (Debounce).

- UI/UX
  - CDK DragDrop für Reordering und Auswahl-Listen; Tailwind für Styles.

- Erweiterbarkeit (Hinweise)
  - Lazy Loading für Features, Interceptors (Error/Retry/Caching), OnPush/Signals, `takeUntil`/`DestroyRef` für sauberes Teardown bei wachsender Komplexität.


## Komponenten

### BookListComponent (Container)
- Verantwortung: Daten laden (HTTP), Suchfeld mit Debounce, Ladezustand, Drag&Drop zwischen Listen, TrackBy.
- Inputs: `pageSize: number = 10`.
- Zustände: `books: Book[]`, `selectedBooks: Book[]`, `loading: boolean`, `searchTerm: string`.
- Imports: `CommonModule`, `FormsModule`, `BookItemComponent`, `DragDropModule`.

```9:23:src/app/books/book-list.component.ts
@Component({
    selector: 'app-book-list',
    standalone: true,
    imports: [CommonModule, FormsModule, BookItemComponent, DragDropModule],
    templateUrl: './book-list.component.html'
})
export class BookListComponent implements OnInit {
    @Input() pageSize: number = 10;
    books: Book[] = [];
    selectedBooks: Book[] = [];
    loading: boolean = true;
    searchTerm: string = '';
```

- Such-Debounce (300ms) und Lade-Flow:

```29:49:src/app/books/book-list.component.ts
private loadBooks(search?: string): void {
    this.loading = true;
    this.bookApiClient.getBooks(this.pageSize, search).subscribe({
        next: books => {
            this.books = books;
            this.loading = false;
        },
        error: error => {
            console.error('Error fetching books:', error);
            this.loading = false;
        }
    });
}

onSearchChange(): void {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
        this.loadBooks(this.searchTerm);
    }, 300);
}
```

- Template: Suche, Loader, Grid, `*ngFor` mit `trackBy`, CDK Drop-Listen.

```30:37:src/app/books/book-list.component.html
<div *ngIf="!loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-8"
     cdkDropList
     id = "booksList"
     [cdkDropListData]="books"
     [cdkDropListConnectedTo]="['selectedList']"
     (cdkDropListDropped)="onDrop($event)">
    <app-book-item *ngFor="let book of books; trackBy: trackById" [book]="book" cdkDrag></app-book-item>
```

- Performance: `trackBy` für stabile IDs; Event Coalescing global aktiv.

```56:58:src/app/books/book-list.component.ts
trackById(index: number, book: Book): string {
    return book.id;
}
```

- DnD-Handler mit CDK:

```60:71:src/app/books/book-list.component.ts
onDrop(event: CdkDragDrop<Book[]>): void {
    if (event.previousContainer === event.container) {
        moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
        transferArrayItem(
            event.previousContainer.data,
            event.container.data,
            event.previousIndex,
            event.currentIndex
        );
    }
}
```

Empfehlungen: Für größere Komponenten `ChangeDetectionStrategy.OnPush`, `async` Pipe oder Signals einsetzen; Teardown via `takeUntil`/`DestroyRef` bei Subscriptions.

### BookItemComponent (Presentational)
- Verantwortung: Darstellung eines Buches (Cover, Titel, Autor, ISBN optional).
- Input: `book: Book` (non-null mit `!`).
- Imports: `CommonModule`, `RouterModule`.

```6:14:src/app/books/book-item.component.ts
@Component({
    selector: 'app-book-item',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './book-item.component.html'
})
export class BookItemComponent {
    @Input() book!: Book;
}
```

- Template mit Alt-Text und Fallback bei fehlendem Cover:

```5:13:src/app/books/book-item.component.html
<img
    *ngIf="book.cover"
    [src]="book.cover"
    [alt]="book.title"
    class="w-full h-full object-contain bg-gray-100"
/>
<div *ngIf="!book.cover" class="w-full h-full bg-gray-100 flex items-center justify-center">
    <span class="text-gray-500 text-sm font-medium">No cover available</span>
</div>
```

Empfehlungen: Bei größerem Template ggf. `OnPush` nutzen und rein input-getrieben halten; bei Navigation später `routerLink` ergänzen.


