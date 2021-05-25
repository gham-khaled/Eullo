import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {User} from "./models/user.interface";
import {environment} from "../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) { }

  register(user: User): Promise<any> {
    return this.http.post(`${environment.BASE_URL}`,user).toPromise();
  }

  login(username: string, password: string) {
    return this.http.post(`${environment.BASE_URL}`, {username, password}).toPromise();
  }
}
