import io
import requests
import pytesseract

from PIL import Image

# TODO: Replace with link passed from the Chrome Extension
response = requests.get("https://i.pinimg.com/564x/9a/5d/46/9a5d46343d3da38c636d3cfcfd2f7cba.jpg")
image = Image.open(io.BytesIO(response.content))
text = pytesseract.image_to_string(image)
print(text)