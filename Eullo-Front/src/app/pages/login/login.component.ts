import {Component, OnInit} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {AuthService} from "../../core/services/auth.service";
import {Router} from "@angular/router";
import {User} from "../../core/models/user.model";
import {CryptoService} from "../../core/services/crypto.service";
import {using} from "rxjs";

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
  error: string = "";

  constructor(private fb: FormBuilder,
              private authService: AuthService,
              private router: Router,
              private cryptoService: CryptoService) {}

  ngOnInit(): void {
    if (this.authService.isAuthenticated())
      this.router.navigate(['/']);
    this.isLoading = false;
  }


  async login() {
    this.isLoading = true;
    this.loginForm.disable();
    const encryptedPrivateKey = localStorage.getItem(`${this.loginForm.get('username')?.value}-encryptedPrivateKey`);
    await this.authService.login(this.loginForm.get('username')?.value, this.loginForm.get('password')?.value)
      // @ts-ignore
      .then((data: User) => {
        this.cryptoService.certificate = data.certificate;
        data.encryptedPrivateKey = encryptedPrivateKey;
        // @ts-ignore
        this.cryptoService.setPrivateKeyFromEncryptedKey(encryptedPrivateKey, this.loginForm.get('password')?.value);
        localStorage.setItem('user', JSON.stringify(data));
        this.authService.credentials = data;
        this.router.navigate(['/']).then(() => {
          console.log('Login successful: Redirecting...');
        });
        this.isLoading = false;
      })
      .catch(error => {
        this.error = "Wrong credentials";
        console.log(this.error);
        this.isLoading = false;
        this.loginForm.enable();
        this.loginForm.get('password')?.reset();
      });
  }

}
