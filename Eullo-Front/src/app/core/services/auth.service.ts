import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {RegisterRequest, User} from "../models/user.interface";
import {environment} from "../../../environments/environment";



@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private _credentials: User | null | undefined;

  constructor(private http: HttpClient) {
    const savedCredentials = localStorage.getItem('user');
    if (savedCredentials) {
      this._credentials = JSON.parse(savedCredentials);
    }
  }

  get credentials(): User | null | undefined {
    return this._credentials;
  }

  set credentials(value: User | null | undefined) {
    this._credentials = value;
  }

  register(user: RegisterRequest): Promise<any> {
    return this.http.post(`${environment.BASE_URL}/auth`, user).toPromise();
  }

  async login(username: string, password: string) {
    let params = new HttpParams().set('username', username);
    params = params.append('password', password);
    return this.http
      .get(`${environment.BASE_URL}/auth`, {params: params})
      .toPromise();
  }

  isAuthenticated(): boolean {
    return !!this.credentials;
  }

  logout() {
    this._credentials = null;
    const user: User = JSON.parse(localStorage.getItem('user'));
    const encryptedPrivateKey = user.encryptedPrivateKey;
    localStorage.removeItem('user');
    localStorage.setItem(`${user.username}-encryptedPrivateKey`,encryptedPrivateKey);
  }
}
