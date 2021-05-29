import {Injectable} from "@angular/core";
import * as forge from "node-forge";
import {User} from "../models/user.interface";

const pki = forge.pki
const rsa = pki.rsa;

const KEY_SIZE = 2048;
@Injectable({
  providedIn: 'root'
})
export class CryptoService {
  private _privateKey;
  private _publicKey;
  private _certificate;

  constructor() {
    const user: User = JSON.parse(localStorage.getItem('user'));
    if (user) {
      this._certificate = pki.certificateFromPem(user.certificate);
      this._publicKey = this._certificate.publicKey;
      this._privateKey = this._certificate.privateKey;
    }
  }

  set privateKey(privateKeyPem: string) {
    this._privateKey = pki.privateKeyFromPem(privateKeyPem);
  }

  set certificate(certificatePem: string) {
    this._certificate = pki.certificateFromPem(certificatePem);
  }

  get certificate() {
    return this._certificate;
  }

  generateCertificateRequestAndEncryptedPrivateKeyPEM(username: string, password: string) {
    const keyPair = rsa.generateKeyPair(KEY_SIZE);
    this._publicKey = keyPair.publicKey;
    this._privateKey = keyPair.privateKey;
    const certificateRequest = pki.createCertificationRequest();
    certificateRequest.publicKey = this._publicKey;
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
    certificateRequest.sign(this._privateKey);
    const encryptedPrivateKey = pki.encryptRsaPrivateKey(keyPair.privateKey, password);
    return {certificateRequest: pki.certificationRequestToPem(certificateRequest), encryptedPrivateKey};
  }

  generateEncryptedPrivateKey(password: string) {
    if (this._privateKey)
      return  pki.encryptRsaPrivateKey(this._privateKey, password);
    return null;
  }
}
