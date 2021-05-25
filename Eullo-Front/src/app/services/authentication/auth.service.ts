import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {User} from "./models/user.interface";
import {environment} from "../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // @ts-ignore
  private _credentials: string | null;

  constructor(private http: HttpClient) {
    const savedCredentials = localStorage.getItem('user');
    if (savedCredentials) {
      this._credentials = savedCredentials;
    }
  }

  get credentials(): string | null {
    return this._credentials;
  }

  set credentials(value: string | null) {
    this._credentials = value;
  }

  register(user: User): Promise<any> {
    return this.http.post(`${environment.BASE_URL}`,user).toPromise();
  }

  async login(username: string, password: string) {
    const user = {username, password};
    this._credentials = JSON.stringify(user); // to remve later
    localStorage.setItem('user', this._credentials); // to remove later
    // return this.http.post(`${environment.BASE_URL}`, {username, password}).toPromise(); //uncomment this later
  }

  isAuthenticated() : boolean {
    return !!this.credentials;
  }

  logout() {
    this._credentials = null;
    localStorage.removeItem('user');
  }
}
