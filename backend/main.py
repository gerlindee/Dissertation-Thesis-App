from logistic_regression import LogisticRegression
from naive_bayes import NaiveBayes
from flask import *
from image_scanner import ImageScanner

app = Flask(__name__)


@app.route('/')
def home():
    output = '<h1> API Reference - Endpoints Documentation'
    output += '<h3> /api/get_text_polarity </h3>'
    output += '<p> Method: [POST] </p>'
    output += '<p> Input: JSON, containing at least one field with key "text", which contains the text to be analysed </p>'
    output += '<p> Returns: JSON, containing a field with key "polarity", which contains the polarity of the given text</p>'
    output += '</br>'
    return output


@app.route('/api/get_text_polarity', methods=['POST'])
def get_text_polarity():
    data_json = request.get_json()
    text = data_json['text']
    text_polarity = classifier.predict_text_polarity(text)
    return jsonify({'polarity': text_polarity})


@app.route('/api/get_image_text_polarity', methods=['POST'])
def get_image_text_polarity():
    data_json = request.get_json()
    image_url = data_json['image_url']
    image_scanner = ImageScanner(image_url)
    text_polarity = classifier.predict_text_polarity(image_scanner.get_text_from_image())
    return jsonify({'polarity': text_polarity})


classifier = LogisticRegression()
classifier.load()
app.run()

