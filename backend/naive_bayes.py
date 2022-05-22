from nltk.corpus import twitter_samples
import numpy as np
from utils import preprocess_text, build_word_freq_dict


class NaiveBayes:
    def __init__(self):
        self.__word_freqs = {}

    @staticmethod
    def lookup(freqs, word, label):
        """
        :param freqs: A dictionary with the frequency of each tuple
        :param word: The word to be looked up
        :param label: The label corresponding to the word to be looked up (Positive/Negative)
        :return: The number of times the word appears in the frequency dictionary
        """

        word_freqs = 0

        pair = (word, label)
        if pair in freqs:
            word_freqs = freqs[pair]

        return word_freqs

    def __train_model(self):
        # Create a file for writing the results of the training; also mark the results with a timestamp, to keep track of trainings
        timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        result_file = open("training_results.txt", "a")
        result_file.write("Logistic Regression Training - " + timestamp + "\n")

        # Retrieve the lists of positive and negative tweets from the NLTK sample
        all_positive_tweets = twitter_samples.strings('positive_tweets.json')
        all_negative_tweets = twitter_samples.strings('negative_tweets.json')

        # Split data for testing and training
        test_positive = all_positive_tweets[4000:]
        test_negative = all_negative_tweets[4000:]

        train_positive = all_positive_tweets[:4000]
        train_negative = all_negative_tweets[:4000]

        test_x = test_positive + test_negative
        train_x = train_positive + train_negative

        # Create numpy arrays for the labels
        test_y = np.append(np.ones((len(test_positive), 1)), np.zeros((len(test_negative), 1)), axis=0)
        train_y = np.append(np.ones((len(train_positive), 1)), np.zeros((len(train_negative), 1)), axis=0)

        self.__word_freqs = build_word_freq_dict(train_x, train_y)