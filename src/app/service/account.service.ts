/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, timer } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '@environments/environment';
import { User } from '@app/models';
import { RetData } from './backend.service';
import { LayoutService } from './app.layout.service';

export interface RetDataUser extends RetData {
    cookie: string | undefined;
}

@Injectable({ providedIn: 'root' })
export class AccountService {
    private _userSubject: BehaviorSubject<User> = new BehaviorSubject(new User());
    public get userSubject(): BehaviorSubject<User> {
        return this._userSubject;
    }
    private apiUrl: string;
    private header!: HttpHeaders;


    constructor(
        private router: Router,
        private http: HttpClient,
        private layoutService: LayoutService,
    ) {
        this.header = new HttpHeaders({
            'Access-Control-Allow-Origin': environment.apiUrlSelf,
            'Access-Control-Allow-Methods': "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
            'Access-Control-Allow-Headers': 'Access-Control-Allow-Headers,Access-Control-Allow-Methods,Access-Control-Allow-Origin, Origin, X-Requested-With, Content-Type, Accept, Authorization',
            'Content-Type': 'application/json'
        });
        this.apiUrl = environment.apiUrl
        const user = localStorage.getItem('user')
        if (user) {
            this._userSubject.next(JSON.parse(user))
        }
        timer(0, 1 * 60000).subscribe({
            next: () => this.refresh()
        });
    }

    public get userValue(): User {
        return this._userSubject.value;
    }

    isLogged(): boolean {

        return this._userSubject && this.userValue.id > 0;
    }

    login(email: string, password: string) {
        return this.http.post<RetDataUser>(`${this.apiUrl}/auth/login`, { email, password })
            .pipe(map(retData => {
                    this.saveUser(retData.data as User, retData.cookie);
                    return this.userValue;
                }
            ));
    }

    async refresh() {
        if (this.isLogged()) {
            const mins = (new Date().getTime() - this.layoutService.userActiveSince.getTime()) / 1000 / 60;
            if (mins > 30 && mins < 60)
                this.http.post<RetDataUser>(`${this.apiUrl}/auth/refreshToken`, this.userValue, { headers: this.header })
                    .subscribe({
                        next: (retData) => {
                            this.saveUser(retData.data as User, retData.cookie);
                            return this.userValue;
                        }
                    });
            else if (mins > 60)
                await this.logout();
        }
    }

    private saveUser(user: User, cookie: string) {
        const lCookie = cookie.split(';');
        user.token = lCookie[0].replace('Authorization=', '');
        // store user details and jwt token in local storage to keep user logged in between page refreshes
        localStorage.setItem('user', JSON.stringify(user));
        this._userSubject.next(user);
        this.layoutService.userActiveSince = new Date();
    }

    async logout() {
        // remove user from local storage and set current user to null
        localStorage.removeItem('user');
        this._userSubject?.next(new User());
        await this.router.navigate(['/']);
    }

    register(user: User) {
        const body = JSON.stringify(user);
        return this.http.post<RetData>(`${this.apiUrl}/auth/register`, body, { headers: this.header });
    }

    getAll() {
        return this.http.get<RetData>(`${this.apiUrl}/user/list`, { headers: this.header });
    }

    getById(id: number) {
        return this.http.get<RetData>(`${this.apiUrl}/user/user/${id}`, { headers: this.header });
    }

    update(id: number, params: any) {
        return this.http.put(`${this.apiUrl}/user/user/${id}`, params, { headers: this.header })
            .pipe(map(x => {
                // update stored user if the logged in user updated their own record
                if (id == this.userValue.id) {
                    // update local storage
                    const user = { ...this.userValue, ...params };
                    localStorage.setItem('user', JSON.stringify(user));

                    // publish updated user to subscribers
                    this._userSubject?.next(user);
                }
                return x;
            }));
    }

    newPasswort(email: string) {
        return this.http.get(`${this.apiUrl}/user/newpass?email=${email}`, { headers: this.header })
            .pipe(map(x => {
                // auto logout if the logged in user deleted their own record
                if (email == this.userValue.email) {
                    this.logout();
                }
                return x;
            }));
    }

    delete(id: number) {
        return this.http.delete(`${this.apiUrl}/user/user/${id}`, { headers: this.header })
            .pipe(map(x => {
                // auto logout if the logged in user deleted their own record
                if (id == this.userValue.id) {
                    this.logout();
                }
                return x;
            }));
    }
}