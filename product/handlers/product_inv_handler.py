from models.productInventory import Product_Inventory
from models.product import Product
from decimal import Decimal
import decimal
import json
from datetime import datetime
from helper.helper_func import DecimalEncoder
from models.EventBridgeEvent import EventbridgeEvent
import os
from gateways.dynamodb_gateway import DynamoDB

db_handler = DynamoDB(os.getenv("DB_INVENTORY_NAME"))

def get_current_datetime():
    """Returns the current date and time in 'YYYY-MM-DD HH:MM:SS' format."""
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")

def query_inventory(product_id):
    response = db_handler.query_items(product_id)
    
    if response["statusCode"] == 200:
        return json.dumps(response["data"], cls=DecimalEncoder)
    
    return response

def post_product_inv(event, context):
    try:
        print(event)
         
        if 'detail' in event:
            body = event['detail']
            
            product_inv = Product_Inventory(
                product_id=body["product_id"],
                datetime=get_current_datetime(),
                quantity=body["quantity"],
                remarks=body.get("remarks", "")
                )
                
            response = product_inv.create()
            
            print(body)
            print(response)
            return response
            
    except ValueError as e:
        return {"message": e}

def delete_product_inv(event, context):
    try:
        print(event)
        
        if 'detail' in event:
            body = event['detail']
            
            products = json.loads(query_inventory(body["product_id"]))
            
            for product in products:
                product_inv = Product_Inventory(
                    product_id=product["product_id"],
                    datetime=product["datetime"],
                )
                
                response = product_inv.delete()
                print(response)

            print(body)
            print(products)
            return response
            
    except ValueError as e:
        return {"message": e}

def add_stocks(event, context):
    try:
        body = json.loads(event["body"], parse_float=Decimal)
        
        product_inv = Product_Inventory(
            product_id=body["product_id"],
            datetime=get_current_datetime(),
            quantity=body["quantity"],
            remarks=body.get("remarks", "")
        )
        
        response = product_inv.create()
        
        if response["statusCode"] == 200:
            event = EventbridgeEvent("stocks_added", json.dumps(product_inv.get_data(), cls=DecimalEncoder))
            event.send()
        
        return {
            "body": response,
            "data": json.dumps(body, cls=DecimalEncoder)
        }
    except Exception as e:
        return {"statusCode": 500, "body": json.dumps({"message": str(e)})}

def update_total_quantity(event, context):
    try:
        print(event)
        
        if 'detail' in event:
            body = event['detail']

            product = Product(product_id=body["product_id"])
            data = product.get()['data']
            print(data)

            sum = data["quantity"] + body.get("quantity")
            print(sum)
            response = product.update({"quantity": int(sum)})
           
            print(response)
            return response

    except ValueError as e:
        return {"message": e}