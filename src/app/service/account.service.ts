/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '@environments/environment';
import { User } from '@app/models';

@Injectable({ providedIn: 'root' })
export class AccountService {
    private userSubject?: BehaviorSubject<User>;
    public user?: Observable<User>;
    private apiUrl: string;

    constructor(
        private router: Router,
        private http: HttpClient
    ) {
        const user = localStorage.getItem('user')
        if (user) {
            this.userSubject = new BehaviorSubject<User>(JSON.parse(user));
            this.user = this.userSubject.asObservable();
        }
        this.apiUrl = environment.apiUrl
        console.log(this.apiUrl)
    }

    public get userValue(): User {
        return (this.userSubject ? this.userSubject.value : new User());
    }

    login(email: string, password: string) {
        return this.http.post<User>(`${this.apiUrl}/users/authenticate`, { email, password })
            .pipe(map(user => {
                // store user details and jwt token in local storage to keep user logged in between page refreshes
                localStorage.setItem('user', JSON.stringify(user));
                this.userSubject?.next(user);
                this.user = this.userSubject?.asObservable();
                return user;
            }));
    }

    async logout() {
        // remove user from local storage and set current user to null
        localStorage.removeItem('user');
        this.userSubject = undefined;
        await this.router.navigate(['/']);
        this.user = undefined;
    }

    register(user: User) {
        return this.http.post(`${this.apiUrl}/users/register`, JSON.stringify(user));
    }

    getAll() {
        return this.http.get<User[]>(`${this.apiUrl}/users`);
    }

    getById(id: number) {
        return this.http.get<User>(`${this.apiUrl}/users/${id}`);
    }

    update(id: number, params: any) {
        return this.http.put(`${this.apiUrl}/users/${id}`, params)
            .pipe(map(x => {
                // update stored user if the logged in user updated their own record
                if (id == this.userValue.id) {
                    // update local storage
                    const user = { ...this.userValue, ...params };
                    localStorage.setItem('user', JSON.stringify(user));

                    // publish updated user to subscribers
                    this.userSubject?.next(user);
                }
                return x;
            }));
    }

    newPasswort(email: string) {
        return this.http.get(`${this.apiUrl}/users/newpass?email=${email}`)
            .pipe(map(x => {
                // auto logout if the logged in user deleted their own record
                if (email == this.userValue.email) {
                    this.logout();
                }
                return x;
            }));
    }

    delete(id: number) {
        return this.http.delete(`${this.apiUrl}/users/${id}`)
            .pipe(map(x =>  {
                // auto logout if the logged in user deleted their own record
                if (id == this.userValue.id) {
                    this.logout();
                }
                return x;
            }));
    }
}