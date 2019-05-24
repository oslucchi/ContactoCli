import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';

import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '@environments/environment.prod';
import { User } from '@app/_models';

const httpOptions = {
    headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Language': 'it_IT'
        // 'Access-Control-Allow-Origin': '*',
        // 'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE',
        // 'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Language, Edit-Mode'
    })
};
@Injectable({ providedIn: 'root' })
export class AuthenticationService {
    private currentUserSubject: BehaviorSubject<User>;
    public currentUser: Observable<User>;

    constructor(private http: HttpClient) {
        this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')));
        this.currentUser = this.currentUserSubject.asObservable();
    }

    public get currentUserValue(): User {
        return this.currentUserSubject.value;
    }

    public get currentLoginToken(): String {
        return localStorage.getItem('token');
    }

    login(email: string, password: string) {
        console.log(`${environment.apiUrl}/rest/auth/login?fromState=0`);
        return this.http.post<any>(`${environment.apiUrl}/rest/auth/login?fromState=0`, { email, password }, httpOptions)
            .pipe(map(response => {
                // login successful if there's a jwt token in the response
                if (response && response.token) {
                    // store user details and jwt token in local storage to keep user logged in between page refreshes
                    localStorage.setItem('currentUser', JSON.stringify(response.user));
                    localStorage.setItem('token', JSON.stringify(response.token));
                    localStorage.setItem('fromState', JSON.stringify(response.fromState));
                    this.currentUserSubject.next(response.user);
                }

                return response;
            }));
    }

    logout() {
        // remove user from local storage to log user out
        localStorage.removeItem('currentUser');
        this.currentUserSubject.next(null);
    }
}