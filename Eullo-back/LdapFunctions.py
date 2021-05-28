import ldap3
from ldap3 import Server, Connection, ALL, MODIFY_REPLACE
import json
from flask import request
import hashlib
import ast


class LdapFunctions:

    def __init__(self):

        self.host = 'ec2-34-247-197-157.eu-west-1.compute.amazonaws.com'
        self.dc = 'dc=ec2-34-247-197-157,dc=eu-west-1,dc=compute,dc=amazonaws,dc=com'
        self.dn = f'ou=Students,{self.dc}'
        self.ldap_username = f'cn=admin,{self.dc}'
        self.ldap_password = 'douda123'
        # self.attributes =  ['displayName', 'uid', 'givenName', 'userPKCS12', 'sn', 'userSMIMECertificate']
        self.attributes = ['uid', 'givenName', 'sn', 'userCertificate', 'userSMIMECertificate', 'userPKCS12']

        self.ldap_server = Server(host=self.host, port=389, use_ssl=False, get_info='ALL')

        # define the connection
        self.conn = Connection(self.ldap_server, user=self.ldap_username, password=self.ldap_password, version=3,
                               authentication='SIMPLE', client_strategy='SYNC', read_only=False, raise_exceptions=True)

    def connect(self):
        if not self.conn.bind():
            return f'error in binding {self.conn.result} '
        else:
            return 'Bind is successful!!'

    def disconnect(self):
        self.conn.unbind()

    def get_users(self):
        self.connect()
        self.conn.search(self.dn, '(&(objectclass=inetOrgPerson)(!(uid=0001)))', attributes=['*'])
        users = []
        for entry in self.conn.entries:
            user = json.loads(entry.entry_to_json())
            # if ('userSMIMECertificate' in user['attributes']):
            #     L = ast.literal_eval(user['attributes']['userSMIMECertificate'][0])
            #     user['attributes']['userCertificate'] = str(np.array(L, dtype='int8').tobytes())
            users.append(user)

        self.disconnect()
        return [self.__convert_user(user) for user in users]

    def get_user(self, username=None):
        if username == None:
            return {}
        print(username)
        self.connect()
        # attributes=['cn', 'sn']
        self.conn.search(self.dn, f'(&(objectclass=inetOrgPerson)(sn={username})(!(uid=0001)))',
                         attributes=self.attributes)
        if not self.conn.entries:
            return {'message': "Invalid Credentials"}, 400
        else:
            user = json.loads(self.conn.entries[0].entry_to_json())
            # if ('userSMIMECertificate' in user['attributes']):
            #     L = ast.literal_eval(user['attributes']['userSMIMECertificate'][0])
            #     # user['attributes']['userCertificate'] = str(np.array(L, dtype='int8').tobytes())

            self.disconnect()
            return self.__convert_user(user)

    def login(self, username, password):
        self.connect()
        m = hashlib.sha256(str(password).encode('utf-8'))
        hashed_pass = m.hexdigest()
        self.conn.search(f'ou=Students,{self.dc}',
                         '(&(objectclass=inetOrgPerson)(sn=' + username + ')(userPassword=' + hashed_pass + '))',
                         attributes=self.attributes)
        if (not self.conn.entries):
            return {'message': "Invalid Credentials"}, 400
        else:
            user = json.loads(self.conn.entries[0].entry_to_json())
            print(user)
            # if ('userSMIMECertificate' in user['attributes']):
            #     L = ast.literal_eval(user['attributes']['userSMIMECertificate'][0])
            #     user['attributes']['userCertificate'] = str(np.array(L, dtype='int8').tobytes())

        self.disconnect()
        return self.__convert_user(user)

    def add_user(self, user):
        self.connect()
        # before adding i need to select by username to make sure it's unique
        self.conn.search(self.dn, f"(&(objectclass=inetOrgPerson)(sn={user['username']}))", attributes=['sn'])
        if self.conn.entries:
            self.disconnect()
            return {'message': "User already exists"}, 400
        else:
            m = hashlib.sha256(str(user['password']).encode('utf-8'))
            hashed_pass = m.hexdigest()
            result = self.conn.add(
                f"cn={user['username']},ou=Students,{self.dc}",
                attributes={
                    "objectClass": "inetOrgPerson",
                    "sn": user['username'],
                    "givenName": f"{user['name']} {user['lastName']}",
                    "uid": user['cardNumber'],
                    # "displayName": user['displayName'],
                    "userPassword": hashed_pass,
                    "userPKCS12": user['encryptedPrivateKey'],
                    # "userCertificate": (user['certificate']).encode('ascii'),
                    "userSMIMECertificate": user['certificate']
                },
            )

            self.conn.unbind()
            if result:
                return 'User added successfully'
            else:
                return {'message': 'Error while creating the user'}, 500

    def __convert_user(self, ldap_user):
        return {"username": ldap_user['attributes']['sn'][0], 'cardNumber': ldap_user['attributes']['uid'][0],
                "certificate": ldap_user['attributes']['userSMIMECertificate'][0]}
