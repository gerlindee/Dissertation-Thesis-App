# Imports for image processing
import io
import requests
import pytesseract
from PIL import Image

# Imports for creating the Flask server
from flask import *

# TODO: Replace with link passed from the Chrome Extension
response = requests.get("https://preview.redd.it/0zbzy7cperl81.jpg?auto=webp&s=d640266253619cea6706badf81482ab7bad93793")
image = Image.open(io.BytesIO(response.content))
text = pytesseract.image_to_string(image)

app = Flask(__name__)


@app.route('/')
def home():
    output = '<h1>' + text + '</h1>'
    return output


app.run()
