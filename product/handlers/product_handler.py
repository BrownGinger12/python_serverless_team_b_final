import json
import urllib
import csv
from decimal import Decimal
from models.product import Product
from gateways.dynamodb_gateway import DynamoDB
from gateways.s3_gateway import S3Gateway
from gateways.logs_gateway import CloudWatchLogger
from helper.helper_func import DecimalEncoder, generate_code
import os
import re

#gateway initialization
db_handler = DynamoDB(os.getenv("DB_NAME"))
product_s3 = S3Gateway(os.getenv("PRODUCT_BUCKET_NAME"))
sqs_s3 = S3Gateway(os.getenv("SQS_BUCKET_NAME"))
logger = CloudWatchLogger("products-created-logs", "current-logs")



def product_handler(event, context):
    http_method = event["requestContext"]["http"]["method"]
    product_id = event.get("pathParameters", {}).get("product_id", "none")


    HANDLER = {
        "GET": lambda: get_product(product_id), 
        "DELETE": lambda: delete_product(product_id), 
        "PUT": lambda: update_product(product_id, json.loads(event["body"], parse_float=Decimal))
    }

    if http_method not in HANDLER:
        return {"statusCode": 405, "body": json.dumps({"message": "Method Not Allowed"})}
    
    
    return HANDLER[http_method]()
        
def get_all_products(event, context):
    try:
        response = db_handler.get_all_items()
        
        if response["statusCode"] != 200:
            return response
        
        return {
            "statusCode": 200,
            "body": json.dumps(response, cls=DecimalEncoder),
            "headers": {
                "Content-Type": "application/json",
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
    

def post_product(event, context):
    try:
        body = json.loads(event["body"], parse_float=Decimal)
        
        product = Product(
            product_id=body["product_id"],
            category=body["category"],
            product_name=body["product_name"],
            price=body["price"],
            quantity=body["quantity"],
            brand_name=body.get("brand_name", ""),
            image_path=body.get("image_path", ""),
        )
        
        response = product.create()
        
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
            "data": body,
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
        
def get_product(product_id):
    try:
        product = Product(product_id=product_id)
        response = product.get()
        
        return {
            "body": response["data"],
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
        
def delete_product(product_id):
    try:
        product = Product(product_id=product_id)
        response = product.delete()
        
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

def update_product(product_id, body):
    try:
        product = Product(product_id=product_id)
        
        response = product.update(body)
        
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

def batch_create_products(event, context):
    print("file uploaded trigger")
    print(event)
    
    key = urllib.parse.unquote_plus(event['Records'][0]['s3']['object']['key'])
    localFilename = f'/tmp/for_create.csv'
    
    try:
        product_s3.download_file(key, localFilename)
        
        with open(localFilename, 'r') as f:
            csv_reader = csv.DictReader(f)
            for row in csv_reader:
                product = Product(
                    product_id=row['product_id'],
                    product_name=row['product_name'],
                    price=Decimal(row['price']),
                    quantity=int(row['quantity']),
                    brand_name=row.get("brand_name", "")
                )
                #logger.send_log({"event": "product_created", "body": json.dumps(row, cls=DecimalEncoder), "status": "Success"})
                product.create()
        print("Notice: products from the csv file successfully added to the products table")
    except ValueError as e:
        print(f"Error: {e}")

def batch_delete_products(event, context):
    print("file uploaded trigger")
    print(event)
    
    key = urllib.parse.unquote_plus(event['Records'][0]['s3']['object']['key'])
    localFilename = f'/tmp/for_create.csv'
    
    try:
        product_s3.download_file(key, localFilename)
        
        with open(localFilename, 'r') as f:
            csv_reader = csv.DictReader(f)
            for row in csv_reader:
                product = Product(product_id=row['product_id'])
                product.delete()
        print("Notice: products from the csv file successfully deleted")
    except ValueError as e:
        print(f"Error: {e}")

def receive_message_from_sqs(event, context):
    print(event)
    fieldnames=["product_id", "product_name", "price", "quantity", "brand_name"]
    file_randomized_prefix = generate_code("pycon_", 8)
    file_name = f'/tmp/product_created_{file_randomized_prefix}.csv'
    object_name = f'product_created_{file_randomized_prefix}.csv'
    
    
    with open(file_name, 'w') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        for payload in event["Records"]:
            json_payload = json.loads(payload["body"])
            writer.writerow(json_payload)
    
    response = sqs_s3.upload_file(file_name, object_name)
        
    print("All done!")
    return {}

def search_by_name(event, context):
    response = db_handler.get_all_items()
    product_name = event.get("pathParameters", {}).get("name", "none")
    filtered_data = {"data": []}

    datas = response["data"]

    for data in datas:
        match_name = re.search(product_name.lower(), data.get("product_name").lower())
        if match_name:
            filtered_data["data"].append(data)

    if response["statusCode"] != 200:
            return response
    
    if filtered_data["data"]:
        return {
            "body": {"statusCode": 404, "message": "item does not exist"},
            "headers": {
                "Access-Control-Allow-Origin": "*",  # Allow all origins
                "Access-Control-Allow-Methods": "POST, GET, OPTIONS",  # Allowed HTTP methods
                "Access-Control-Allow-Headers": "Content-Type"  # Allowed headers
            }
        }
        
    return {
        "statusCode": 200,
        "body": json.dumps(filtered_data, cls=DecimalEncoder),
        "headers": {
            "Access-Control-Allow-Origin": "*",  # Allow all origins
            "Access-Control-Allow-Methods": "POST, GET, OPTIONS",  # Allowed HTTP methods
            "Access-Control-Allow-Headers": "Content-Type"  # Allowed headers
        }
    }