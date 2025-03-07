def hello(event, context):
    body = {
        "message": "Go Serverless v4.0! Your function executed successfully!",
    }
    
    print(f"This print statement is for debugging purposes only {event}")

    response = {"statusCode": 200, "body": json.dumps(body)}

    return response