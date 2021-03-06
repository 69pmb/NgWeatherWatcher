import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import jwtDecode from 'jwt-decode';
import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Token } from '../../model/token';
import { UtilsService } from './utils.service';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService extends UtilsService {
  token$: BehaviorSubject<Token> = new BehaviorSubject(undefined);

  constructor(
    private router: Router,
    protected httpClient: HttpClient,
    protected toast: ToastService
  ) {
    super(httpClient, toast);
  }

  private static setToken(token: string): void {
    localStorage.removeItem('token');
    localStorage.setItem('token', token);
  }

  private reject(loggout: boolean): Promise<boolean> {
    if (loggout) {
      this.logout(loggout);
    }
    return new Promise(resolve => resolve(false));
  }

  logout(showToast: boolean): void {
    localStorage.clear();
    sessionStorage.clear();
    this.token$.next(undefined);
    sessionStorage.setItem('redirectPage', '/');
    this.router.navigate(['/user/signin']);
    if (showToast) {
      this.toast.success('user.logged_out');
    }
  }

  isAuthenticated(): Promise<boolean> {
    const token = this.token$.getValue();
    if (token && (token).exp * 1000 > new Date().getTime()) {
      return new Promise(resolve => resolve(true));
    } else {
      try {
        const jwtToken = jwtDecode(localStorage.getItem('token')) as Token;
        if (jwtToken && (jwtToken).exp * 1000 > new Date().getTime()) {
          return new Promise(resolve => resolve(true));
        } else {
          return this.reject(false);
        }
      } catch (err) {
        return this.reject(false);
      }
    }
  }

  signin(username: string, password: string): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      return this.httpClient.post(`${environment.apiUrl}/${environment.userUrl}/signin`,
        { username, password }, { observe: 'response' })
        .subscribe((response: HttpResponse<any>) => {
          if (response.body != null && response.body !== 'null' && response.body) {
            const token = response.body.token;
            AuthService.setToken(token);
            this.token$.next(jwtDecode(token));
            this.toast.success('user.signin.connected');
            return resolve(true);
          } else {
            console.error('no token', response.body);
            return this.reject(true);
          }
        }, (response: HttpErrorResponse) => {
          this.handleError(response);
          return this.reject(false);
        });
    });
  }

  signup(username: string, password: string, favouriteLocation: string): Promise<number> {
    return new Promise<number>((resolve) => {
      return this.httpClient.post(`${environment.apiUrl}/${environment.userUrl}/signup`,
        { username, password, favouriteLocation }, { observe: 'response' })
        .subscribe((response: HttpResponse<any>) => {
          return resolve(response.status);
        }, (response: HttpErrorResponse) => {
          this.handleError(response);
          return resolve(response.status);
        });
    });
  }

  getCurrentUser(): void {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const jwtToken = jwtDecode(token) as Token;
        if (jwtToken && (jwtToken).exp * 1000 > new Date().getTime()) {
          this.token$.next(jwtToken);
        } else {
          this.logout(false);
        }
      } else {
        this.logout(false);
      }
    } catch (err) {
      this.handleError(err);
      this.logout(false);
    }
  }

}
