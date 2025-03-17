from decimal import Decimal
import json
from gateways.dynamodb_gateway import DynamoDB
from helper.helper_func import DecimalEncoder, generate_code
import os
from models.order import Order
from models.product import Product
from datetime import datetime
import time

#gateway initialization
db_handler = DynamoDB(os.getenv("ORDERS_TABLE"))

def get_current_datetime():
    """Returns the current date and time in 'YYYY-MM-DD HH:MM:SS' format."""
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")


def order_handler(event, context):
    http_method = event["requestContext"]["http"]["method"]
    order_id = event.get("pathParameters", {}).get("order_id", "none")


    HANDLER = {
        "GET": lambda: get_order(order_id), 
        "DELETE": lambda: delete_order(order_id), 
        "PUT": lambda: update_order(order_id, json.loads(event["body"], parse_float=Decimal))
    }

    if http_method not in HANDLER:
        return {"statusCode": 405, "body": json.dumps({"message": "Method Not Allowed"})}
    
    
    return HANDLER[http_method]()

def get_all_orders(event, context):
    try:
        response = db_handler.get_all_items()
        
        if response["statusCode"] != 200:
            return response
        
        return {
            "statusCode": 200,
            "body": json.dumps(response, cls=DecimalEncoder),
            "headers": {
                "Access-Control-Allow-Origin": "*",  # Allow all origins
                "Access-Control-Allow-Methods": "POST, GET, OPTIONS",  # Allowed HTTP methods
                "Access-Control-Allow-Headers": "Content-Type"  # Allowed headers
            }
        }
        
    except Exception as e:
        return {"statusCode": 500, "message": str(e),
            "headers": {
                "Access-Control-Allow-Origin": "*",  # Allow all origins
                "Access-Control-Allow-Methods": "POST, GET, OPTIONS",  # Allowed HTTP methods
                "Access-Control-Allow-Headers": "Content-Type"  # Allowed headers
            }}

def generate_order_id():
    timestamp = int(time.time() * 1000)  # Get current time in milliseconds
    return f"ord-{timestamp}"

def post_order(event, context):
    try:
        body = json.loads(event["body"], parse_float=Decimal)


        product = Product(product_id=body["product_id"])

        prod_data = product.get()

        if not prod_data.get('data'):
            return {
                "body": {"statusCode": 404, "message": "product does not exist"},
                "headers": {
                    "Access-Control-Allow-Origin": "*",  # Allow all origins
                    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",  # Allowed HTTP methods
                    "Access-Control-Allow-Headers": "Content-Type"  # Allowed headers
                }
            }
        

        if isinstance(body.get("quantity"), str):  # Ensure "quantity" exists and is a string
            try:
                body["quantity"] = int(body["quantity"])
            except ValueError:
                raise ValueError(f"Invalid quantity value: {body.get('quantity')}. Must be a valid number.")

        if body["quantity"] > prod_data['data'].get("quantity"):
            return {
                "body": {"statusCode": 500, "message": "quantity is greater than current stock"},
                "headers": {
                    "Access-Control-Allow-Origin": "*",  # Allow all origins
                    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",  # Allowed HTTP methods
                    "Access-Control-Allow-Headers": "Content-Type"  # Allowed headers
                }
            }
        

        price_per_unit = prod_data['data'].get("price")

        total_amount = body["quantity"]*price_per_unit
        

        order = Order(
            order_id=body.get("order_id") or generate_order_id(),
            product_id=body["product_id"],
            product_name=body["product_name"],
            user_id=body["user_id"],
            datetime=get_current_datetime(),
            contact_number=body["contact_number"],
            quantity=body["quantity"],
            status="pending",
            total_price=body.get("total_price", Decimal(total_amount)),
        )
        
        response = order.create()
        
        if response["statusCode"] != 200:
            return {
                "body": response,
                "headers": {
                    "Access-Control-Allow-Origin": "*",  # Allow all origins
                    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",  # Allowed HTTP methods
                    "Access-Control-Allow-Headers": "Content-Type"  # Allowed headers
                }
            }
        #logger.send_log({"event": "product_created", "body": json.dumps(body, cls=DecimalEncoder), "status": "Success"})
        
        return {
            "body": response,
            "data":body,
            "headers": {
                "Access-Control-Allow-Origin": "*",  # Allow all origins
                "Access-Control-Allow-Methods": "POST, GET, OPTIONS",  # Allowed HTTP methods
                "Access-Control-Allow-Headers": "Content-Type"  # Allowed headers
            }
        }
        

    except Exception as e:
        return {"statusCode": 500, "body": json.dumps({"message": str(e)}),
                "headers": {
                    "Access-Control-Allow-Origin": "*",  # Allow all origins
                    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",  # Allowed HTTP methods
                    "Access-Control-Allow-Headers": "Content-Type"  # Allowed headers
                }}
        
def get_order(order_id):
    try:
        order = Order(order_id=order_id)
        response = order.get()
        
        return {
            "body": response,
            "headers": {
                "Access-Control-Allow-Origin": "*",  # Allow all origins
                "Access-Control-Allow-Methods": "GET",  # Allowed HTTP methods
                "Access-Control-Allow-Headers": "Content-Type"  # Allowed headers
            }
        }
        
    except Exception as e:
        return {"statusCode": 500, "body": json.dumps({"message": str(e)}),
            "headers": {
                "Access-Control-Allow-Origin": "*",  # Allow all origins
                "Access-Control-Allow-Methods": "GET",  # Allowed HTTP methods
                "Access-Control-Allow-Headers": "Content-Type"  # Allowed headers
            }}
        
def delete_order(order_id):
    try:
        order = Order(order_id=order_id)
        response = order.delete()
        
        return {
            "body": response,
            "headers": {
                "Access-Control-Allow-Origin": "*",  # Allow all origins
                "Access-Control-Allow-Methods": "DELETE",  # Allowed HTTP methods
                "Access-Control-Allow-Headers": "Content-Type"  # Allowed headers
            }
        }
        
    except Exception as e:
        return {"statusCode": 500, "message": str(e),
            "headers": {
                "Access-Control-Allow-Origin": "*",  # Allow all origins
                "Access-Control-Allow-Methods": "DELETE",  # Allowed HTTP methods
                "Access-Control-Allow-Headers": "Content-Type"  # Allowed headers
            }}

def update_order(order_id, body):
    try:
        order = Order(order_id=order_id)
        
        response = order.update(body)
        
        return {
            "body": response,
            "headers": {
                "Access-Control-Allow-Origin": "*",  # Allow all origins
                "Access-Control-Allow-Methods": "PUT",  # Allowed HTTP methods
                "Access-Control-Allow-Headers": "Content-Type"  # Allowed headers
            }
        }
        
    except ValueError as e:
        return {"statusCode": 500, "message": str(e),
            "headers": {
                "Access-Control-Allow-Origin": "*",  # Allow all origins
                "Access-Control-Allow-Methods": "PUT",  # Allowed HTTP methods
                "Access-Control-Allow-Headers": "Content-Type"  # Allowed headers
            }}