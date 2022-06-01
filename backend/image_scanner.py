# Imports for image processing
import io
import requests
import pytesseract
from PIL import Image


class ImageScanner:
    def __init__(self, image_url):
        self.__imageURL = image_url

    def get_text_from_image(self):
        response = requests.get(self.__imageURL)
        image = Image.open(io.BytesIO(response.content))
        text = pytesseract.image_to_string(image)

        return text
