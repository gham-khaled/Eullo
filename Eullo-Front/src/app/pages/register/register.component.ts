import { Component, OnInit } from '@angular/core';
import {FormBuilder, Validators} from "@angular/forms";
import {AuthService} from "../../core/services/auth.service";
import {Router} from "@angular/router";
import * as forge from "node-forge";
import {User} from "../../core/models/user.model";
import {CryptoService} from "../../core/services/crypto.service";

const pki = forge.pki
const rsa = pki.rsa;

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

  constructor(private fb: FormBuilder,
              private authService: AuthService,
              private router: Router,
              private cryptoService: CryptoService) { }

  ngOnInit(): void {
    if (this.authService.isAuthenticated())
      this.router.navigate(['/']);
  }

  // @ts-ignore
  generateEncryptedPrivateKeyPEM(privateKey, password:string) {
    return  pki.encryptRsaPrivateKey(privateKey, password);
  }

  async register() {
    const { encryptedPrivateKey, certificateRequest} = this.cryptoService.generateCertificateRequestAndEncryptedPrivateKeyPEM(this.registerForm.get('username')?.value,this.registerForm.get('password')?.value);

    this.isLoading = true;
    this.registerForm.disable();
    const hashedPassword = this.cryptoService.hash(this.registerForm.get('password')?.value);
    const user = {
      ...this.registerForm.value,
      password: hashedPassword,
      encryptedKey: encryptedPrivateKey,
      certificateRequest
    }

    await this.authService.register(user)
      .then(async data => {
        await this.authService.login(user.username, user.password)
          // @ts-ignore
          .then((loginResponse: User) => {
            this.cryptoService.certificate = loginResponse.certificate;
            // @ts-ignore
            loginResponse.privateKey = this.cryptoService.decryptPrivateKey(loginResponse.encryptedKey, this.registerForm.get('password')?.value);
            localStorage.setItem('user',JSON.stringify(loginResponse))
            this.authService.credentials = loginResponse;
            this.isLoading = false;
            this.router.navigate(['/']).then(() => {
              console.log('Login successful: Redirecting...');
              // console.clear();
            });
          })
          .catch(error => console.log(`An error has occurred: ${error.message}`))
      })
      .catch(error => {
        console.error(`An error has occurred: ${error.message}`);
        this.isLoading = false;
        this.registerForm.enable();
        this.registerForm.get('password')?.reset();
      })
  }

}
