from flask import Flask
from flask_socketio import SocketIO
import cv2
import base64


app = Flask(__name__)
socket_io = SocketIO(app)


@socket_io.on('message')
def handle_message(msg):
    frame = base64.decodebytes(msg)
    frame = cv2.imdecode(frame, cv2.IMREAD_COLOR)
    cv2.imshow('ImageWindow', frame)
    cv2.waitKey(1)


if __name__ == '__main__':
    socket_io.run(app)
