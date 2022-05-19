from logistic_regression import LogisticRegression
from flask import *

app = Flask(__name__)


@app.route('/')
def home():
    output = '<h1>' + classifier.predict_text_polarity("Hello have a good day") + '</h1>'
    return output


@app.route('/api/get_text_polarity', methods=['POST'])
def add():
    data_json = request.get_json()
    text = data_json['text']
    text_polarity = classifier.predict_text_polarity(text)
    return jsonify({'polarity': text_polarity})


classifier = LogisticRegression()
classifier.load()
app.run()

