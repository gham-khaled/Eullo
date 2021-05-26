import { Component, OnInit } from '@angular/core';
import {FormBuilder, Validators} from "@angular/forms";
import {AuthService} from "../services/authentication/auth.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  registerForm = this.fb.group({
    name: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    username: ['', [Validators.required]],
    password: ['', [Validators.required]],
    cardNumber: ['', [Validators.required]]
  })

  isLoading: boolean = false;
  error: string = "";

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    if (this.authService.isAuthenticated())
      this.router.navigate(['/']);
  }

  async register() {
    console.log(this.registerForm.value);
    this.isLoading = true;
    this.registerForm.disable();
    const user = {
      ...this.registerForm.value
    }
    console.log(user)
    await this.authService.register(user)
      .then(data => {
        this.isLoading = false;
        this.router.navigate(['/login']).then(() => {
          console.log('Register successful: Redirecting...');
          console.clear();
        });
      })
      .catch(error => {
        console.log(error);
        this.error = "Username already existing";
        console.log(this.error);
        this.isLoading = false;
        this.registerForm.enable();
        this.registerForm.get('password')?.reset();
      })
  }

}
