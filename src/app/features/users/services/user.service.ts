import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SystemUser } from '../models/user.model';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = '/api/users';

    getUsers(): Observable<SystemUser[]> {
        return this.http.get<SystemUser[]>(this.apiUrl);
    }
}
