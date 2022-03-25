import json
import subprocess


# # # global fields # # #
streaming_process = None


class App:

    # # # functions # # #
    def __init__(self):
        print("\nApp has been instantiated")

    @staticmethod
    def stop_camera():
        global streaming_process

        if streaming_process is not None:
            print("\nStopping camera...")

            # noinspection PyUnresolvedReferences
            streaming_process.kill()
            streaming_process = None
        else:
            print("\nNo streaming process; no stop necessary")

    def show_camera(self, is_bool):
        global streaming_process

        print("Message to stream (true = turn on, false = turn off):\n{0}".format(is_bool))

        if is_bool:
            if streaming_process is None:
                stream_source = '/Users/spencerkeith/Desktop/School/Spring-2022/CS-355/CS-355-AI-Smart-Security-System/src/client/test1.mkv'
                stream_options = '-c:v libx264 -preset veryfast -maxrate 3000k -bufsize 6000k -pix_fmt yuv420p -g 50 -c:a aac -b:a 160k -ac 2 -ar 44100 -f flv'
                stream_output = 'rtmp://localhost/live/keithse2556'

                stream_command = 'ffmpeg -re -i ' + stream_source + ' -y ' + stream_options + ' ' + stream_output
                streaming_process = subprocess.Popen(stream_command, shell=True, stdin=subprocess.PIPE)
            else:
                print("\nStreaming already in progress")

        else:
            self.stop_camera()

    def decode_message(self, payload):
        json_message = json.loads(payload)              # decode json message from payload
        action = json_message.get('action')             # fetch action from message; set as action
        payload_value = json_message.get('payload')     # fetch payload from message; set as payload_value

        if action == 'stream':                  # if the action is 'stream'
            self.show_camera(payload_value)     # run the show_camera function w/ determined payload_value parameter
