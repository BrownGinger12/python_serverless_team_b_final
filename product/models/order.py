from datetime import datetime
import decimal
import os
from gateways.dynamodb_gateway import DynamoDB
from helper.helper_func import build_update_expression, validate_update_product

db_handler = DynamoDB(os.getenv("ORDERS_TABLE"))

class Order:
    def __init__(self, order_id, product_id="", user_id="", product_name="", datetime="", contact_number="", quantity=0, total_price=0, status=""):
        self.order_id = order_id
        self.product_id = product_id
        self.user_id = user_id
        self.product_name = product_name
        self.datetime = datetime
        self.quantity = quantity
        self.contact_number = contact_number
        self.total_price = total_price
        self.status = status
    
    def get_data(self):
        return {
            "order_id": self.order_id,
            "product_id": self.product_id,
            "product_name": self.product_name,
            "user_id": self.user_id,
            "datetime": self.datetime,
            "contact_number": self.contact_number,
            "quantity": self.quantity,
            "order_status": self.status,
            "total_price": self.total_price
        }
    
    def validate_product_order(self):
        self.validate_id(self.order_id)
        self.validate_id(self.product_id)
        self.validate_contact_number(self.contact_number)
        self.validate_product_name(self.product_name)
        self.validate_id(self.user_id)
        self.validate_datetime(self.datetime)
        self.validate_quantity(self.quantity)
        self.validate_price(self.total_price)
        self.validate_status(self.status)
    

    def validate_id(self, product_id):
        if not product_id or not isinstance(product_id, str):
            raise ValueError("ID cannot be empty and must be a string.")

    def validate_datetime(self, dt):
        try:
            datetime.strptime(dt, "%Y-%m-%d %H:%M:%S")  # Example format: '2025-03-06 14:30:00'
        except ValueError:
            raise ValueError("Invalid datetime format. Use 'YYYY-MM-DD HH:MM:SS'.")

    def validate_quantity(self, quantity):
        if not isinstance(quantity, (int, float)):
            raise ValueError("Quantity must be a contact_number.")
    
    def validate_product_name(self, product_name):
        """Checks if product_name is empty."""
        if not isinstance(product_name, str) or not product_name.strip():
            raise ValueError("Product name must not be empty")
        
    def validate_status(self, status):
        if not status or not isinstance(status, str):
            raise ValueError("Status cannot be empty and must be a string.")
        
    def validate_contact_number(self, contact_number):
        if not contact_number or not isinstance(contact_number, str):
            raise ValueError("contact_number cannot be empty.")
        
    def validate_price(self, total_price):
        """Checks if price is a decimal and non-negative."""
        if not isinstance(total_price, (int, float, decimal.Decimal)):
            raise ValueError("Price must be a decimal or contact_number")
        if total_price < 0:
            raise ValueError("Price cannot be negative")  


    def create(self):
        self.validate_product_order()
        
        response = db_handler.put_item(self.get_data())
    
        if response["statusCode"] == 200:
            print("Notice: Product successfully ordered!")
        
        return response
    
    def delete(self):
        response = db_handler.delete_item({"order_id": self.order_id})
        
        if response["statusCode"] == 200:
            print("Notice: order deleted successfully")
            
        return response
    
    def get(self):
        response = db_handler.get_item({"order_id": self.order_id})
        
        return response
    
    def update(self, body):
        validate_update_product(self.order_id, body)
        
        expression_to_update, expression_val = build_update_expression(body)
        
        if expression_to_update:
            expression_to_update = "SET " + ", ".join(expression_to_update)
            
            response = db_handler.update_item({"order_id": self.order_id}, expression_to_update, expression_val)
                
            if response["statusCode"] == 200:
                print("Notice: order updated successfully!")
        
            return response
        
        return {"statusCode": 400, "message": "No valid fields to update"}