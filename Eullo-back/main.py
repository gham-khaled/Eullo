import json

import sqlalchemy
from flask import Flask, request
import flask.scaffold

flask.helpers._endpoint_from_view_func = flask.scaffold._endpoint_from_view_func

from flask_restful import Api, Resource
from flask_cors import CORS
from flask_socketio import SocketIO, emit, send
from flask_sqlalchemy import SQLAlchemy
from LdapFunctions import LdapFunctions
import pymysql

app = Flask(__name__)


api = Api(app)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins='*')

ldapFunctions = LdapFunctions()



class Message(Resource):
    def get(self, username):
        pass


class User(Resource):
    def get(self, username):
        return ldapFunctions.get_user(username)

    def post(self):
        user = request.get_json()
        return ldapFunctions.add_user(user)
    ######### LDAP


class Users(Resource):
    def get(self):
        return ldapFunctions.get_users()


class Auth(Resource):
    def post(self):
        user = request.get_json()
        return ldapFunctions.add_user(user)

    def get(self):
        username = request.args.get('username')
        password = request.args.get('password')
        return ldapFunctions.login(username, password)


@socketio.on('message')
def send_message(message):
    print(message)
    receiver = message['receiver']
    sender = message['sender']
    body = message['body']
    if receiver in connected_users:
        send(message, broadcast=True, room=connected_users[receiver])


@socketio.on('connect')
def add_connection():
    current_socket_id = request.sid
    username = request.args.get('username')
    connected_users[username] = current_socket_id


@socketio.on('disconnect')
def remove_connection():
    username = request.args.get('username')
    del connected_users[username]


connected_users = {}


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
api.add_resource(Users, '/users')
api.add_resource(Auth, '/auth')

if __name__ == '__main__':
    conn = pymysql.connect(
        host='eullo-cluster.cluster-c0zm1odhbvnh.eu-west-1.rds.amazonaws.com',
        port=3306,
        user='douda',
        password='douda123',
        db='eullo',
    )
    app.run(debug=True)
