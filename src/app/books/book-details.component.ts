import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Book } from './book';
import { BookApiClient } from './book-api-client.service';

@Component({
    selector: 'app-book-details',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './book-details.component.html',
    styleUrl: './book-details.component.scss'
})
export class BookDetailsComponent implements OnInit, OnDestroy {
    book: Book | null = null;
    loading: boolean = true;
    error: string | null = null;
    private destroy$ = new Subject<void>();

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private bookApiClient: BookApiClient
    ) {}

    ngOnInit(): void {
        this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
            const bookId = params['id'];
            if (bookId) {
                this.loadBookDetails(bookId);
            }
        });
    }

    private loadBookDetails(bookId: string): void {
        this.loading = true;
        this.error = null;
        this.bookApiClient.getBookById(bookId).pipe(takeUntil(this.destroy$)).subscribe({
            next: (book: Book) => {
                this.book = book;
                this.loading = false;
            },
            error: (error: any) => {
                console.error('Error fetching book details:', error);
                this.error = 'Failed to load book details. Please try again.';
                this.loading = false;
            }
        });
    }

    goBack(): void {
        this.router.navigate(['/']);
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}

