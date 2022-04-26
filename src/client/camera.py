import base64
import cv2
from datetime import datetime
import numpy as np


class Camera:

    cap = None
    last_frame = None
    frame = None
    motion_frame = None
    frame_timestamp = None
    is_different = None

    def __init__(self, camera_port):
        self.camera_port = camera_port

        self.cap = cv2.VideoCapture(camera_port)
        self.cap.set(3, 320)
        self.cap.set(4, 240)

    def capture_frame(self):
        ret, self.frame = self.cap.read()
        self.frame_timestamp = datetime.now()

    def motion_detector(self):
        # load motion_frame from frame
        img_brg = np.array(self.frame)
        self.motion_frame = cv2.cvtColor(src=img_brg, code=cv2.COLOR_BGR2RGB)

        # prepare frame with greyscale and blur
        prepared_frame = cv2.cvtColor(self.motion_frame, cv2.COLOR_BGR2GRAY)
        prepared_frame = cv2.GaussianBlur(src=prepared_frame, ksize=(5, 5), sigmaX=0)

        # "0th" case
        if self.last_frame is None:
            self.last_frame = prepared_frame

        # calculate difference and update previous frame
        diff_frame = cv2.absdiff(src1=self.last_frame, src2=prepared_frame)
        self.last_frame = prepared_frame

        # dilute frame for contour detection
        kernel = np.ones((5, 5))
        diff_frame = cv2.dilate(diff_frame, kernel, 1)

        # only take areas different enough (>20 / 255)
        thresh_frame = cv2.threshold(src=diff_frame, thresh=100, maxval=255, type=cv2.THRESH_BINARY)[1]

        # find contours
        contours, _ = cv2.findContours(image=thresh_frame, mode=cv2.RETR_EXTERNAL, method=cv2.CHAIN_APPROX_SIMPLE)
        # draw bounding rectangles around contours
        for contour in contours:
            if cv2.contourArea(contour) < 50:
                # too small, skip!
                continue
            (x, y, w, h) = cv2.boundingRect(contour)
            cv2.rectangle(img=self.motion_frame, pt1=(x, y), pt2=(x + w, y + h), color=(0, 255, 0), thickness=2)
        if len(contours) > 0:
            print('Motion detected!')
            return True
        else:
            return False

    def send_frame(self, client_socket):
        result, self.frame = cv2.imencode('.jpg', self.frame)
        data = base64.b64encode(self.frame)  # convert to base64 format
        print('Sending capture: ' + self.frame_timestamp.__str__())
        client_socket.emit('data', data)

    @staticmethod
    def store_frame():
        print("STORING FRAME")
