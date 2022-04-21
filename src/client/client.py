import socketio
import cv2
import time
import base64


client_socket = socketio.Client()
url = 'http://localhost:5000/'


@client_socket.event
def connect():
    print('Connected to', url)


@client_socket.event
def connect_error():
    print('Connection failed')


@client_socket.event
def message(data):
    print('I received a message:', data)


client_socket.connect(url)

cap = cv2.VideoCapture(0)
cap.set(3, 320)
cap.set(4, 240)

img_counter = 0

encode_param = [int(cv2.IMWRITE_JPEG_QUALITY), 90]

while True:
    ret, frame = cap.read()
    result, frame = cv2.imencode('.jpg', frame)
    data = base64.b64encode(frame)  # convert to base64 format
    print('Sending frame #', img_counter)
    client_socket.emit('data', data)

    img_counter += 1
    time.sleep(1)
