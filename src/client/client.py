from camera import Camera
from dbconnector import DBConnector
import socketio
import time


frame_rate = 0.5
do_stream = False
do_store = False
do_motion_detection = False
do_facial_recognition = False

client_socket = socketio.Client(logger=True)
url = 'http://localhost:5000'


@client_socket.on('start_stream')
def start_stream():
    global do_stream
    print('Start stream...')
    do_stream = True


@client_socket.on('stop_stream')
def stop_stream():
    global do_stream
    print('Stop stream...')
    do_stream = False


@client_socket.on('start_store')
def start_store():
    global do_store
    print('Start storing...')
    do_store = True


@client_socket.on('stop_store')
def stop_store():
    global do_store
    print('Stop storing...')
    do_store = False


@client_socket.on('start_motion_detection')
def start_motion_detection():
    global do_motion_detection
    print('Start motion detection...')
    do_motion_detection = True


@client_socket.on('stop_motion_detection')
def stop_motion_detection():
    global do_motion_detection
    print('Stop motion detection...')
    do_motion_detection = False


@client_socket.on('start_facial_recognition')
def start_facial_recognition():
    global do_facial_recognition
    print('Start facial recognition...')
    do_facial_recognition = True


@client_socket.on('stop_facial_recognition')
def stop_facial_recognition():
    global do_facial_recognition
    print('Stop facial recognition...')
    do_facial_recognition = False


@client_socket.on('refresh_face_cache')
def refresh_faces():
    cam.get_encoded_faces()
    print('Successfully refreshed face cache!')


@client_socket.on('change_frame_rate')
def set_frame_rate(data):
    global frame_rate
    print('Setting frame rate...')
    frame_rate = data


client_socket.connect(url)

db_conn = DBConnector('alfred.cs.uwec.edu', 'KEITHSE2556', 'WYQ5S334', 'KEITHSE2556')
db_conn.connect_to_database()

db_conn.list_tables()
db_conn.fetch_from_table('footage', '*')

cam = Camera(0)

cam.get_encoded_faces()
while True:
    if do_stream or do_store:
        cam.capture_frame()
        if do_motion_detection:
            if cam.motion_detector():
                if do_facial_recognition:
                    cam.classify_face()
                if do_stream:
                    cam.send_frame(client_socket)
                if do_store:
                    db_conn.insert_new_footage(cam.frame_binary)
        else:
            if do_facial_recognition:
                cam.classify_face()
            if do_stream:
                cam.send_frame(client_socket)
            if do_store:
                db_conn.insert_new_footage(cam.frame_binary)

    time.sleep(frame_rate)
