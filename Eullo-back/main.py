import json
from flask import Flask, request
import flask.scaffold
flask.helpers._endpoint_from_view_func = flask.scaffold._endpoint_from_view_func

from flask_restful import Api, Resource
from flask_cors import CORS
from flask_socketio import SocketIO, emit

from LdapFunctions import LdapFunctions

app = Flask(__name__)
api = Api(app)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins='*')

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


@socketio.on('custom_send')
def send_message(msg):
    message = json.loads(msg)
    print(message)
    emit('custom_receive', {'data': message['data'], 'receiver': message['receiver'], 'source': message['source'],
                            'time': message['time']}, broadcast=True)


connected_users = {"connected_users": []}


@socketio.on('custom_connect')
def broadcast_connect(msg):
    message = json.loads(msg)
    print(message['sn'] + " connected")
    connected_users["connected_users"].append({'sn': message['sn']})
    print(connected_users)
    emit('broadcast_connect', connected_users, broadcast=True)


@socketio.on('custom_disconnect')
def broadcast_disconnect(msg):
    message = json.loads(msg)
    print(message['sn'] + " disconnected")
    # connected_users["connected_users"].pop(connected_users["connected_users"].index(message))
    emit('broadcast_disconnect', connected_users, broadcast=True)


api.add_resource(User, '/user/<username>')
api.add_resource(Auth, '/auth')

if __name__ == '__main__':
    app.run(debug=True)