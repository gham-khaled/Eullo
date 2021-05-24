from flask import Flask, request
import flask.scaffold

flask.helpers._endpoint_from_view_func = flask.scaffold._endpoint_from_view_func
from flask_restful import Api, Resource
from flask_cors import CORS
from LdapFunctions import LdapFunctions

app = Flask(__name__)
api = Api(app)
CORS(app)
ldapFunctions = LdapFunctions()


class User(Resource):
    def get(self, username):
        return ldapFunctions.get_user(username)

    def put(self, username):
        return ldapFunctions.modify_user(username)

    def delete(self, username):
        return ldapFunctions.delete_user(username)

    def post(self):
        user = request.get_json()
        return ldapFunctions.add_user(user)
    ######### LDAP


class Auth(Resource):
    def post(self):
        user = request.get_json()
        return ldapFunctions.add_user(user)


api.add_resource(User, '/user/<username>')
api.add_resource(Auth, '/auth')

if __name__ == '__main__':
    app.run(debug=True)
