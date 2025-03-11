from s3_gateway import S3Gateway
import os

image_bucket = S3Gateway(os.getenv("IMAGE_BUCKET_NAME"))
image_bucket.upload_file(r"C:\Users\Cloud Account\Downloads\humidity.png", "test.jpg")