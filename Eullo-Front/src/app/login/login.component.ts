import { Component, OnInit } from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';

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
  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.isLoading = false;
  }

  login() {
    console.log(`Login: ${this.loginForm.get('username')?.value} ${this.loginForm.get('password')?.value}`);
  }


}
