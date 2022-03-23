from autobahn.twisted.websocket import WebSocketClientProtocol
import json
from app import App


class AppProtocol(WebSocketClientProtocol):

    # # # functions # # #
    def onConnect(self, response):
        print("\nSuccessfully connected to server!")
        self.factory.resetDelay()

    def onOpen(self):
        print("Connection is open...")

        message = {"action": "pi_online", "payload": {"id": "tabvn", "secret": "key"}}
        self.sendMessage(json.dumps(message).encode('utf8'))

    def onMessage(self, payload, is_binary):
        if is_binary:
            print("\nReceived binary message from server:\n{0}".format(len(payload)))
        else:
            print("\nReceived text message from server:\n{0}".format(payload.decode('utf8')))

            app = App()
            app.decode_message(payload)

    def onClose(self, was_clean, code, reason):
        print("\nConnection closed:\n{0}".format(reason))
