import re
import string
import nltk, ssl
from nltk.corpus import stopwords, twitter_samples
from nltk.stem import PorterStemmer
from nltk.tokenize import TweetTokenizer
import numpy as np


class LogisticRegression:
    def __init__(self):
        self.__test_positive = []
        self.__test_negative = []

        self.__train_positive = []
        self.__train_negative = []

        self.__word_freqs = {}

        self.__theta = 0

    @staticmethod
    def __download_nltk_samples():
        """
        Download the Twitter Sample json files, as well as the Stopwords json files, into the project structure
        """

        # In order to download the files, we need to generate an SSL certificate -> Otherwise the download methods will fail
        try:
            _create_unverified_https_context = ssl._create_unverified_context
        except AttributeError:
            pass
        else:
            ssl._create_default_https_context = _create_unverified_https_context

        nltk.download('twitter_sample')
        nltk.download('stopwords')