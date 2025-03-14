import json
import decimal
from decimal import Decimal
import string
import random

def build_update_expression(body):
    """Builds the update expression and values for updating a product."""
    expression_to_update = []
    expression_val = {}

    product_name = body.get("product_name")
    brand_name = body.get("brand_name")
    category = body.get("category")
    price = body.get("price")
    quantity = body.get("quantity")
    status = body.get("order_status")

    if product_name:
        expression_to_update.append("product_name = :val1")
        expression_val[":val1"] = product_name
    if category:
        expression_to_update.append("category = :val2")
        expression_val[":val2"] = category
    if brand_name:
        expression_to_update.append("brand_name = :val3")
        expression_val[":val3"] = brand_name
    if price is not None:
        expression_to_update.append("price = :val4")
        expression_val[":val4"] = price
    if quantity is not None:
        expression_to_update.append("quantity = :val5")
        expression_val[":val5"] = quantity
    if status is not None:
        expression_to_update.append("order_status = :val6")
        expression_val[":val6"] = status

    return expression_to_update, expression_val

class DecimalEncoder(json.JSONEncoder):
  def default(self, obj):
    if isinstance(obj, Decimal):
      return str(obj)
    return json.JSONEncoder.default(self, obj)

def validate_update_product(product_id, body):
    """Validates product update request."""
    if not isinstance(product_id, str) or not product_id.strip():
        raise ValueError("Product ID must not be empty")

    if "product_name" in body:
        if not isinstance(body["product_name"], str) or not body["product_name"].strip():
            raise ValueError("Product name must not be empty")
    if "category" in body:
        if not isinstance(body["category"], str) or not body["category"].strip():
            raise ValueError("category name must not be empty")
        
    if "price" in body:
        try:
            price = decimal.Decimal(str(body["price"]))
        except (ValueError, decimal.InvalidOperation):
            raise ValueError("Price must be a valid decimal number")
        
        if price < 0:
            raise ValueError("Price cannot be negative")

    if "quantity" in body:
        if not isinstance(body["quantity"], (int, float)):
            raise ValueError("Quantity must be a number")
        
    if "order_status" in body:
          if not isinstance(body["order_status"], str) or not body["order_status"].strip():
            raise ValueError("Status name must not be empty")

def generate_code(prefix, string_length):
  letters = string.ascii_uppercase
  return prefix + ''.join(random.choice(letters) for i in range(string_length))