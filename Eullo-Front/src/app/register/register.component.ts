import { Component, OnInit } from '@angular/core';
import {FormBuilder, Validators} from "@angular/forms";
import {AuthService} from "../services/authentication/auth.service";
import {Router} from "@angular/router";
import * as forge from "node-forge";

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

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    if (this.authService.isAuthenticated())
      this.router.navigate(['/']);
  }


  generateKeyPair() {
    return rsa.generateKeyPair(2048);
  }

  // @ts-ignore
  generateCertificateRequestPEM(keyPair, username:string) {
    const certificateRequest = pki.createCertificationRequest();
    certificateRequest.publicKey = keyPair.publicKey;
    certificateRequest.setSubject([{
      name: 'commonName',
      value: username
    }, {
      name: 'countryName',
      value: 'TN'
    }, {
      name: 'localityName',
      value: 'Tunis'
    }, {
      name: 'organizationName',
      value: 'Eullo'
    }, {
      shortName: 'OU',
      value: 'Test'
    }]);
    certificateRequest.sign(keyPair.privateKey);
    return pki.certificationRequestToPem(certificateRequest);
  }

  // @ts-ignore
  generateEncryptedPrivateKeyPEM(privateKey, password:string) {
    return   pki.encryptRsaPrivateKey(privateKey, password);
  }

  async register() {
    const keyPair = this.generateKeyPair();
    const certificateRequest = this.generateCertificateRequestPEM(keyPair,this.registerForm.get('username')?.value);
    const encryptedPrivateKey = this.generateEncryptedPrivateKeyPEM(keyPair.privateKey, this.registerForm.get('password')?.value);

    this.isLoading = true;
    this.registerForm.disable();

    const user = {
      ...this.registerForm.value,
      encryptedPrivateKey,
      certificateRequest
    }
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
