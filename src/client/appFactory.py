from autobahn.twisted.websocket import WebSocketClientFactory
from twisted.internet.protocol import ReconnectingClientFactory
from appProtocol import AppProtocol


class AppFactory(WebSocketClientFactory, ReconnectingClientFactory):

    # # # class fields # # #
    protocol = AppProtocol

    # # # functions # # #
    def clientConnectionFailed(self, connector, reason):
        print("\nFailed to connect to server:\n{0}".format(reason))
        self.retry(connector)

    def clientConnectionLost(self, connector, reason):
        print("\nConnection lost, attempting to reconnect...\n{0}".format(reason))
        self.retry(connector)
