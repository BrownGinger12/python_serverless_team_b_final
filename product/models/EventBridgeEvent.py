import json
import os

from gateways.eventbridge_gateway import EventbridgeGateway


class EventbridgeEvent:
    EVENT_BUS = os.getenv("EVENT_BUS_NAME")
    SOURCE_URL = os.getenv("SOURCE_URL")

    def __init__(self, event_name, event_body):
        self.event_name = event_name
        self.event_body = event_body

    def serialize(self):

        return {
            "Source": self.SOURCE_URL,
            "DetailType": self.event_name,
            "Detail": self.event_body,
            "EventBusName": self.EVENT_BUS,
        }

    def send(self):
        event_json = self.serialize()
        EventbridgeGateway.put_event(event_json)