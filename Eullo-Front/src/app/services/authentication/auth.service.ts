import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {User} from "../../models/user.interface";
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

  register(user: User): Promise<any> {
    return this.http.post(`${environment.BASE_URL}/auth`, user).toPromise();
  }

  async login(username: string, password: string) {
    let params = new HttpParams().set('username', username);
    params = params.append('password', password);
    return this.http.get(`${environment.BASE_URL}/auth`, {params: params}).toPromise(); //uncomment this later
    // this._credentials = JSON.stringify(user); // to remve later
    // localStorage.setItem('user', this._credentials); // to remove later

  }

  isAuthenticated(): boolean {
    return !!this.credentials;
  }

  logout() {
    this._credentials = null;
    localStorage.removeItem('user');
  }
}
