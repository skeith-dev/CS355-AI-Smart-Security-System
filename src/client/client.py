import socketio
import time
from camera import Camera


frame_rate = 1
do_stream = False
do_store = False

client_socket = socketio.Client(logger=True)
url = 'http://localhost:5000/'


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


client_socket.connect(url)
cam = Camera(0)

while True:
    if do_stream or do_store:
        cam.capture_frame()
    if do_stream:
        if cam.motion_detector():
            cam.classify_face()
            cam.send_frame(client_socket)
    if do_store:
        cam.store_frame()

    time.sleep(frame_rate)
