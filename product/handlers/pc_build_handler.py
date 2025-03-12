from openai import OpenAI
import os
import json
from decimal import Decimal
from gateways.dynamodb_gateway import DynamoDB
from helper.helper_func import DecimalEncoder

key = os.getenv("API_KEY")
client = OpenAI(api_key = key)
db_handler = DynamoDB(os.getenv("DB_NAME"))


def generate_pc_build(event, context):
    try:
        amount = event.get("pathParameters", {}).get("amount", "none")
        response = db_handler.get_all_items()


        completion = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {
                    "role": "user",
                    "content": f"create a pc build that cost around {amount} use these pc parts for building {json.dumps(response, cls=DecimalEncoder)}"
                }
            ]
        )

        return {"statusCode": 500, "body": json.dumps({"message": completion.choices[0].message}),
                "headers": {
                    "Access-Control-Allow-Origin": "*",  # Allow all origins
                    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",  # Allowed HTTP methods
                    "Access-Control-Allow-Headers": "Content-Type"  # Allowed headers
                }} 

    except Exception as e:
        return {"statusCode": 500, "body": json.dumps({"message": str(e)}),
                "headers": {
                    "Access-Control-Allow-Origin": "*",  # Allow all origins
                    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",  # Allowed HTTP methods
                    "Access-Control-Allow-Headers": "Content-Type"  # Allowed headers
                }} 
    

