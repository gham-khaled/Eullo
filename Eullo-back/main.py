from flask import Flask
from flask_restful import Api, Resource
from flask_cors import CORS

app = Flask(__name__)
api = Api(app)
CORS(app)


class User(Resource):
    def get(self, username):
        return ldapFunctions.get_user(username)

    def put(self, username):
        return ldapFunctions.modify_user(username)

    def delete(self, username):
        return ldapFunctions.delete_user(username)
    ######### LDAP


if __name__ == '__main__':
    app.run(debug=True)
