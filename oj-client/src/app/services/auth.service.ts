// src/app/auth/auth.service.ts

import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import * as auth0 from 'auth0-js';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class AuthService {
  userProfile = new BehaviorSubject<any>(undefined);

  auth0 = new auth0.WebAuth({
    clientID: 'X_4d3NnqIWKUNKgK4HUbS1OebJq4Oooa',
    domain: 'qingdong.auth0.com',
    responseType: 'token id_token',
    redirectUri: 'http://localhost:3000/',
    scope: 'openid profile'
  });

  constructor(public router: Router) {
    this.userProfile.next(JSON.parse(localStorage.getItem('profile')));
  }

  public login(): void {
    this.auth0.authorize();
  }


  public handleAuthentication(): void {
    this.auth0.parseHash((err, authResult) => {
      if (authResult && authResult.accessToken && authResult.idToken) {
        window.location.hash = '';
        this.setSession(authResult);
        this.getProfile();
        this.router.navigate(['/home']);
      } else if (err) {
        this.router.navigate(['/home']);
        console.log(err);
      }
    });
  }

  private setSession(authResult): void {
    // Set the time that the access token will expire at
    const expiresAt = JSON.stringify((authResult.expiresIn * 1000) + new Date().getTime());
    localStorage.setItem('access_token', authResult.accessToken);
    localStorage.setItem('id_token', authResult.idToken);
    localStorage.setItem('expires_at', expiresAt);
  }


  public getProfile(): void {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      throw new Error('Access token must exist to fetch profile');
    }

    const self = this;
    this.auth0.client.userInfo(accessToken, (err, profile) => {
      if (profile) {
        // self.userProfile = profile;
        self.userProfile.next(profile);
        localStorage.setItem('profile', JSON.stringify(profile));
      }
    });
  }

  public logout(): void {
    // Remove tokens and expiry time from localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('id_token');
    localStorage.removeItem('expires_at');
    localStorage.removeItem('profile');
    // Go back to the home route
    this.router.navigate(['/']);
  }

  public isAuthenticated(): boolean {
    // Check whether the current time is past the
    // access token's expiry time
    const expiresAt = JSON.parse(localStorage.getItem('expires_at'));
    return new Date().getTime() < expiresAt;
  }

}
