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
                ffmpeg_command = 'ffmpeg -re -i /Users/toan/Tutorials/stream/video.mkv -c:v libx264 -preset veryfast -maxrate 3000k -bufsize 6000k -pix_fmt yuv420p -g 50 -c:a aac -b:a 160k -ac 2 -ar 44100 -f flv rtmp://localhost/live/tabvn'

                streaming_process = subprocess.Popen(ffmpeg_command, shell=True, stdin=subprocess.PIPE)
            else:
                print("\nStreaming already in progress")

        else:
            self.stop_camera()

    def decode_message(self, payload):
        print("\nMessage from server: {0}".format(payload))

        json_message = json.loads(payload)              # decode json message from payload
        action = json_message.get('action')             # fetch action from message; set as action
        payload_value = json_message.get('payload')     # fetch payload from message; set as payload_value

        if action == 'stream':                  # if the action is 'stream'
            self.show_camera(payload_value)     # run the show_camera function w/ determined payload_value parameter
