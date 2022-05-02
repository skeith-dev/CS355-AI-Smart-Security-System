import base64
import cv2
from datetime import datetime
import face_recognition as fr
import face_recognition
import numpy as np
import os


class Camera:

    cap = None
    motion_frame = None
    last_frame = None
    frame = None
    frame_binary = None
    frame_timestamp = None
    is_different = None
    faces_encoded = None
    known_face_names = None

###########################################################################
# constructor method

    def __init__(self, camera_port):
        self.camera_port = camera_port

        self.cap = cv2.VideoCapture(camera_port)
        self.cap.set(3, 320)
        self.cap.set(4, 240)

###########################################################################
# frame methods

    def capture_frame(self):
        ret, self.frame = self.cap.read()
        self.frame_timestamp = datetime.now()
        self.frame_binary = cv2.imencode('.jpg', self.frame)[1].tobytes()

    def send_frame(self, client_socket):
        result, self.frame = cv2.imencode('.jpg', self.frame)
        data = base64.b64encode(self.frame)  # convert to base64 format
        print('Sending capture: ' + self.frame_timestamp.__str__())
        client_socket.emit('data', data)

###########################################################################
# AI analysis methods

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

    def get_encoded_faces(self):
        encoded = {}
        for directory_path, directory_names, file_names in os.walk("/Users/spencerkeith/Desktop/School/Spring 2022/CS 355/CS-355-AI-Smart-Security-System/src/client/faces"):
            for file in file_names:
                if file.endswith(".jpg") or file.endswith(".png"):
                    face = fr.load_image_file("/Users/spencerkeith/Desktop/School/Spring 2022/CS 355/CS-355-AI-Smart-Security-System/src/client/faces/" + file)
                    encoding = fr.face_encodings(face)[0]
                    encoded[file.split(".")[0]] = encoding

        self.faces_encoded = list(encoded.values())
        self.known_face_names = list(encoded.keys())

    def classify_face(self):
        face_locations = face_recognition.face_locations(self.frame)
        unknown_face_encodings = face_recognition.face_encodings(self.frame, face_locations)

        face_names = []
        for face_encoding in unknown_face_encodings:
            # See if the face is a match for the known face(s)
            matches = face_recognition.compare_faces(self.faces_encoded, face_encoding)
            name = "Unknown"

            # use the known face with the smallest distance to the new face
            face_distances = face_recognition.face_distance(self.faces_encoded, face_encoding)
            best_match_index = np.argmin(face_distances)
            if matches[best_match_index]:
                name = self.known_face_names[best_match_index]

            face_names.append(name)

            for (top, right, bottom, left), name in zip(face_locations, face_names):
                # Draw a box around the face
                cv2.rectangle(self.frame, (left - 20, top - 20), (right + 20, bottom + 20), (255, 0, 0), 2)

                # Draw a label with a name below the face
                cv2.rectangle(self.frame, (left - 20, bottom - 15), (right + 20, bottom + 20), (255, 0, 0), cv2.FILLED)
                font = cv2.FONT_HERSHEY_DUPLEX
                cv2.putText(self.frame, name, (left - 20, bottom + 15), font, 1.0, (255, 255, 255), 2)
