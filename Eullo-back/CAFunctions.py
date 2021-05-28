from cryptography import x509
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from datetime import datetime, timedelta
from uuid import uuid4
import os

from cryptography.x509.oid import NameOID


class CAFunctions:
    def __init__(self):
        PROJECT_ROOT = os.path.realpath(os.path.dirname(__file__))

        print(next(os.walk('.'))[1])
        self.private_key = None
        self.ca_cert = None
        self.private_key_path = os.path.join(PROJECT_ROOT, "authorite.key")
        self.ca_cert_path = os.path.join(PROJECT_ROOT, "authorite.cert")
        self.load_certif()
        self.load_private_key()

    def load_certif(self):
        with open(self.ca_cert_path, "rb") as f:
            self.ca_cert = x509.load_pem_x509_certificate(f.read(), default_backend())

    def load_private_key(self):
        if os.path.isfile(self.private_key_path):
            with open(self.private_key_path, "rb") as key_file:
                self.private_key = serialization.load_pem_private_key(
                    key_file.read(),
                    password=None,
                    backend=default_backend()
                )
        else:
            print("Wrong Path")

    def generate_key(self, keyfile):
        key = rsa.generate_private_key(
            public_exponent=65537,
            key_size=2048,
            backend=default_backend()
        )

        key_pem = key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.TraditionalOpenSSL,
            encryption_algorithm=serialization.NoEncryption(),
        )

        with open(keyfile, "wb+") as f:
            f.write(key_pem)

        public_key = key.public_key()

        pem = public_key.public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo
        ).decode("utf-8")
        print(pem)

        return pem

    def generate_client_csr(self, keyfile, username, certfile, csrfile):

        if os.path.isfile(keyfile):
            with open(keyfile, "rb") as key_file:
                private_key = serialization.load_pem_private_key(
                    key_file.read(),
                    password=None,
                    backend=default_backend()
                )

            # set organisation name to issuer name
            subject = x509.Name([
                x509.NameAttribute(NameOID.COMMON_NAME, username),
                x509.NameAttribute(NameOID.COUNTRY_NAME, u"TN"),
                x509.NameAttribute(NameOID.STATE_OR_PROVINCE_NAME, u"Tunis"),
                x509.NameAttribute(NameOID.LOCALITY_NAME, u"Lafayette"),
                x509.NameAttribute(NameOID.ORGANIZATION_NAME, u"INSAT"),
            ])

            # issuer = x509.Name([
            #    x509.NameAttribute(NameOID.COMMON_NAME, username)
            # ])

            # build certif
            # basic_contraints = x509.BasicConstraints(ca=True, path_length=0)
            # now = datetime.utcnow()

            csrbuilder = x509.CertificateSigningRequestBuilder()
            csrbuilder = csrbuilder.subject_name(subject)
            csrbuilder = csrbuilder.add_extension(
                x509.BasicConstraints(ca=False, path_length=None), critical=True,
            )
            csr = csrbuilder.sign(
                private_key, hashes.SHA256(), default_backend()
            )
            csr_pem = csr.public_bytes(encoding=serialization.Encoding.PEM)

            # certbuilder= certbuilder.subject_name(subject)
            # certbuilder = certbuilder.issuer_name(issuer)
            # certbuilder = certbuilder.public_key(private_key.public_key())
            # certbuilder = certbuilder.serial_number(int(uuid4()))
            # certbuilder = certbuilder.not_valid_before(now)
            # certbuilder = certbuilder.not_valid_after(now + timedelta(days=10*365))
            # certbuilder = certbuilder.add_extension(basic_contraints, False)

            # certificate = certbuilder.sign(private_key, hashes.SHA256(), default_backend())
            # cert_pem = certificate.public_bytes(encoding=serialization.Encoding.PEM)

            with open(csrfile, "wb+") as f:
                f.write(csr_pem)

            print(csr_pem.decode("utf-8"))
            return csr_pem.decode("utf-8")

    # generate self signed certif
    def generate_self_signed_certif(self, subject_name, issuer, certfile):

        self.load_private_key()

        # set organisation name to issuer name
        subject = x509.Name([
            x509.NameAttribute(NameOID.COMMON_NAME, subject_name)
        ])

        issuer = x509.Name([
            x509.NameAttribute(NameOID.COMMON_NAME, issuer)
        ])

        # build certif
        basic_contraints = x509.BasicConstraints(ca=True, path_length=0)
        now = datetime.utcnow()
        certbuilder = x509.CertificateBuilder()
        certbuilder = certbuilder.subject_name(subject)
        certbuilder = certbuilder.issuer_name(issuer)
        certbuilder = certbuilder.public_key(self.private_key.public_key())
        certbuilder = certbuilder.serial_number(1)
        certbuilder = certbuilder.not_valid_before(now)
        certbuilder = certbuilder.not_valid_after(now + timedelta(days=10 * 365))
        certbuilder = certbuilder.add_extension(basic_contraints, False)

        certificate = certbuilder.sign(self.private_key, hashes.SHA256(), default_backend())
        cert_pem = certificate.public_bytes(encoding=serialization.Encoding.PEM)

        with open(certfile, "wb+") as f:
            f.write(cert_pem)

        path = os.path.dirname(__file__)
        self.ca_cert_path = os.path.join(path, '../certificates/ca_cert.pem')
        self.load_certif()

    def get_public_key(self):
        return self.ca_cert.public_key()

    def get_CA_cert(self):
        return self.ca_cert

    def sign(self, csr_data, username):

        # print(csr_data)

        csr = x509.load_pem_x509_csr(csr_data.encode('utf8'), default_backend())
        if username != csr.subject.get_attributes_for_oid(NameOID.COMMON_NAME)[0].value:
            print(username)
            return None
        # build certif
        basic_contraints = x509.BasicConstraints(ca=False, path_length=None)
        now = datetime.utcnow()
        certbuilder = x509.CertificateBuilder()
        certbuilder = certbuilder.subject_name(csr.subject)
        certbuilder = certbuilder.issuer_name(self.ca_cert.subject)
        certbuilder = certbuilder.public_key(csr.public_key())
        certbuilder = certbuilder.serial_number(int(uuid4()))
        certbuilder = certbuilder.not_valid_before(now - timedelta(days=1))
        certbuilder = certbuilder.not_valid_after(now + timedelta(days=10 * 365))
        certbuilder = certbuilder.add_extension(basic_contraints, False)

        certificate = certbuilder.sign(self.private_key, hashes.SHA256(), default_backend())
        client_pub_key = certificate.public_key()
        cert_pem = certificate.public_bytes(encoding=serialization.Encoding.PEM)

        pub_pem = client_pub_key.public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo
        )

        return cert_pem, pub_pem.decode("utf-8")

    def verify_certif(self, cert_pem):

        with open('../certificates/ca_cert.pem', 'rb') as root_cert_file:
            root_cert = root_cert_file.read()

        trusted_certs = [root_cert]
        verified = self.verify_chain_of_trust(cert_pem['cert_pem'], trusted_certs)

        if verified:
            print('Certificate verified')
            return True
        return False

    def verify_chain_of_trust(self, cert_pem, trusted_cert_pems):
        try:
            print(cert_pem)
            # cert = x509.load_pem_x509_certificate(cert_pem, default_backend())
            # print(cert)
            # base64.b64decode(cert_pem)
            certificate = crypto.load_certificate(crypto.FILETYPE_PEM, cert_pem)

            # Create and fill a X509Sore with trusted certs
            store = crypto.X509Store()
            for trusted_cert_pem in trusted_cert_pems:
                trusted_cert = crypto.load_certificate(crypto.FILETYPE_PEM, trusted_cert_pem)
                store.add_cert(trusted_cert)

            # Create a X590StoreContext with the cert and trusted certs
            # and verify the the chain of trust
            store_ctx = crypto.X509StoreContext(store, certificate)
            # Returns None if certificate can be validated

            result = store_ctx.verify_certificate()

            if result is None:
                return True
            else:
                return False
        except:
            return False
