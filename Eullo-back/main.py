import json
from flask import Flask, request
import flask.scaffold

from CAFunctions import CAFunctions

# import eventlet
# eventlet.monkey_patch()

flask.helpers._endpoint_from_view_func = flask.scaffold._endpoint_from_view_func
from flask_restful import Api, Resource
from flask_cors import CORS
from flask_socketio import SocketIO, emit, send
from LdapFunctions import LdapFunctions
import pymysql

app = Flask(__name__)

api = Api(app)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins='*')

ldapFunctions = LdapFunctions()
ca_functions = CAFunctions()

conn = pymysql.connect(
    host='eullo-cluster.cluster-c0zm1odhbvnh.eu-west-1.rds.amazonaws.com',
    port=3306,
    user='douda',
    password='douda123',
    db='eullo',
    cursorclass=pymysql.cursors.DictCursor,
    autocommit=True

)


class Messages(Resource):
    def get(self, username):
        cur = conn.cursor()
        cur.execute(
            f' SELECT user1 as sender, user2 as receiver, msg1 as encrypted_sender, msg2 as encrypted_receiver FROM conversation   WHERE (user1 = "{username}" OR user2 = "{username}") GROUP BY  least(user1, user2), greatest(user1, user2)')
        conversations = cur.fetchall()
        for conversation in conversations:
            partner = conversation['sender'] if conversation['sender'] != username else conversation['receiver']
            if partner in connected_users:
                conversation['connected'] = True
            else:
                conversation['connected'] = False
        return conversations


class Message(Resource):
    def get(self, username):
        cur = conn.cursor()
        partner = request.args.get('partner')
        cur.execute(
            f' SELECT user1 as sender, user2 as receiver, msg1 as encrypted_sender, msg2 as encrypted_receiver FROM conversation   WHERE (user1 = "{username}" AND user2 = "{partner}") OR (user1 = "{partner}" AND user2 = "{username}")')
        conversation = cur.fetchall()
        partner_infos= ldapFunctions.get_user(username)
        return {"conversation": conversation, "certificate": partner_infos['certificate']}


class User(Resource):
    def get(self, username):
        return ldapFunctions.get_user(username)

    def post(self):
        user = request.get_json()
        print(user)
        # return ldapFunctions.add_user(user)
    ######### LDAP


class Users(Resource):
    def get(self):

        all_users = ldapFunctions.get_users()
        for user in all_users:
            if user['username'] in connected_users:
                user['connected'] = True
            else:
                user['connected'] = False
        return all_users


class Auth(Resource):
    def post(self):
        user = request.get_json()
        # print(user)
        user['certificate'], user['pubKey'] = ca_functions.sign(user['certificateRequest'], user['username'])
        ldapFunctions.add_user(user)
        return user['certificate'].decode("utf-8")

    def get(self):
        username = request.args.get('username')
        password = request.args.get('password')
        return ldapFunctions.login(username, password)


@socketio.on('message')
def send_message(message):
    print(message)
    receiver = message['receiver']
    sender = message['sender']
    sender_encrypted = message['sender_encrypted']
    receiver_encrypted = message['receiver_encrypted']
    cur = conn.cursor()
    cur.execute("INSERT INTO conversation (user1,user2,msg1,msg2) VALUES (%s, %s, %s, %s)",
                (sender, receiver, sender_encrypted, receiver_encrypted))
    conn.commit()
    print(connected_users)
    if receiver in connected_users:
        send(message, broadcast=True, room=connected_users[receiver])


@socketio.on('connect')
def add_connection():
    print("")
    current_socket_id = request.sid
    username = request.args.get('username')
    certificate = request.args.get('certificate')
    print(certificate)
    connected_users[username] = current_socket_id
    print(connected_users)


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
api.add_resource(Messages, '/messages/<username>')
api.add_resource(Message, '/message/<username>')

if __name__ == '__main__':
    # socketio.run()
    #
    # app.run(  host="0.0.0.0", port=8080)
    socketio.run(app, host='0.0.0.0', port=8080)
