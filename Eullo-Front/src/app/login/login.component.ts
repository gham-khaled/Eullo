import { Component, OnInit } from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {AuthService} from "../services/authentication/auth.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginForm = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]]
  });

  isLoading: boolean = false;
  error: string ="";
  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    if (this.authService.isAuthenticated())
      this.router.navigate(['/']);
    this.isLoading = false;
  }

  async login() {
    console.log(`Login: ${this.loginForm.get('username')?.value} ${this.loginForm.get('password')?.value}`);
    this.isLoading = true;
    this.loginForm.disable();
    console.log(this.loginForm.get('username')?.value,this.loginForm.get('password')?.value)
    await this.authService.login(this.loginForm.get('username')?.value,this.loginForm.get('password')?.value)
      .then(data  => {
        localStorage.setItem('user', JSON.stringify(data));
        this.authService.credentials = localStorage.getItem('user');
        this.router.navigate(['/']).then(() => {
          console.log('Login successful: Redirecting...');
          // console.clear();
        });
        this.isLoading = false;
      })
      .catch(error => {
        this.error = "Wrong credentials";
        this.isLoading = false;
        this.loginForm.enable();
        this.loginForm.get('password')?.reset();
      });
  }

}
