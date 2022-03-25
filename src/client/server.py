import socket
import cv2
import pickle
import struct


ip_address = 'localhost'
port = 8080

server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

server_socket.bind((ip_address, port))
print('Socket bound to', ip_address, port)
server_socket.listen(10)
print('Socket listening...')

conn, addr = server_socket.accept()

data = b""
payload_size = struct.calcsize(">L")
print("Payload size: {}".format(payload_size))

while True:
    while len(data) < payload_size:
        data += conn.recv(4096)

    packed_msg_size = data[:payload_size]
    data = data[payload_size:]
    msg_size = struct.unpack(">L", packed_msg_size)[0]
    print("Message size: {}".format(msg_size))

    while len(data) < msg_size:
        data += conn.recv(4096)

    frame_data = data[:msg_size]
    data = data[msg_size:]

    frame = pickle.loads(frame_data, fix_imports=True, encoding="bytes")
    frame = cv2.imdecode(frame, cv2.IMREAD_COLOR)
    cv2.imshow('ImageWindow', frame)
    cv2.waitKey(1)
