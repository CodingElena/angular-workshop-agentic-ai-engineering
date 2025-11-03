import { Routes } from '@angular/router';
import { BookListComponent } from './books/book-list.component';

export const routes: Routes = [
    { path: '', component: BookListComponent },
    { path: '**', redirectTo: '' }
];
