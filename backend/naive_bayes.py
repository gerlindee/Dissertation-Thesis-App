from nltk.corpus import twitter_samples
import numpy as np
import datetime
from utils import preprocess_text, build_word_freq_dict
import pickle


class NaiveBayes:
    def __init__(self):
        self.__word_freqs = {}
        self.__log_prior = 0
        self.__log_likelihood = {}

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
        result_file.write("Naive Bayes Regression Training - " + timestamp + "\n")

        # Retrieve the lists of positive and negative tweets from the NLTK sample
        all_positive_tweets = twitter_samples.strings('positive_tweets.json')
        all_negative_tweets = twitter_samples.strings('negative_tweets.json')

        # Get the dataset for training
        train_positive = all_positive_tweets[:4000]
        train_negative = all_negative_tweets[:4000]

        # Create training sets:
        #   - train_x = the list of actual tweets used for training
        #   - train_y = the labels for the tweets used for training (0 for negative and 1 for positive)
        train_x = train_positive + train_negative
        train_y = np.append(np.ones((len(train_positive), 1)), np.zeros((len(train_negative), 1)), axis=0)
        result_file.write("train_y.shape = " + str(train_y.shape) + "\n")

        self.__word_freqs = build_word_freq_dict(train_x, train_y)
        result_file.write("Word Frequency Dictionary size: " + str(len(self.__word_freqs.keys())) + "\n")

        # Calculate the number of unique words in the vocabulary
        vocab = set([pair[0] for pair in self.__word_freqs.keys()])
        vocab_size = len(vocab)

        # Calculate the number of positive and negative words in the training set
        n_pos = n_neg = 0
        for pair in self.__word_freqs.keys():
            # If the label is a positive number, greater than 0 -> The word is considered to have a positive sentiment
            if pair[1] > 0:
                n_pos += self.__word_freqs.get(pair, 1)
            else:
                # Otherwise, when the label < 0 -> The word is considered to have a negative sentiment
                n_neg += self.__word_freqs.get(pair, 1)

        # Calculate the number of documents
        d = len(train_y)

        # Calculate the number of positive texts -> Since train_y contains a value 0 or a value 1 for each document in the training set
        #   -> we can get the number of positive documents by adding up the 1 values
        d_pos = sum(train_y)

        # Calculate the number of negative texts -> Total texts - Positive texts
        d_neg = d - d_pos

        # Calculate log_prior
        self.__log_prior = np.log(d_pos) - np.log(d_neg)

        # Calculate log_likelihood for each word in the vocabulary
        self.__log_likelihood = {}
        for word in vocab:
            # Get the positive and negative frequency of the word
            freq_pos = self.__word_freqs.get((word, 1), 0)
            freq_neg = self.__word_freqs.get((word, 0), 0)

            # Calculate the probability that the word is positive...
            prob_word_pos = (freq_pos + 1) / (n_pos + vocab_size)

            # ...and the probability that the word is negative
            prob_word_neg = (freq_neg + 1) / (n_neg + vocab_size)

            # Calculate the log likelihood of the word
            self.__log_likelihood[word] = np.log(prob_word_pos / prob_word_neg)

        result_file.write("\n")
        result_file.close()

    def __predict_text(self, text):
        text_clean = preprocess_text(text)

        # Initialize the prediction with value 0
        pred = 0

        # Add the log_prior value
        pred += self.__log_prior

        for word in text_clean:
            # Check if each word exists in the log_likelihood dictionary
            if word in self.__log_likelihood:
                # If so, add the value of the log_likelihood for the specific word to the probability
                pred += self.__log_likelihood[word]

        return pred

    def predict_text_polarity(self, text):
        prediction = self.__predict_text(text)

        if prediction > 0:
            return "POSITIVE"
        else:
            return "NEGATIVE"

    def __write_results_to_file(self):
        # Write the word frequency dictionary into a separate json file
        pickle.dump(self.__word_freqs, open("word_freqs_naive_bayes.json", "wb"))

        # Write the prediction parameters into a separate file
        params = {'log_prior': self.__log_prior, 'log_likelihood': self.__log_likelihood}
        pickle.dump(params, open("parameters_naive_bayes.json", "wb"))

    def execute(self):
        self.__train_model()
        self.__write_results_to_file()

    def __load_data_from_files(self):
        # Read the word frequency dictionary from the json file
        self.__word_freqs = pickle.load(open("word_freqs_naive_bayes.json", "rb"))

        # Read the parameters from the appropriate file
        params = pickle.load(open("parameters_naive_bayes.json", "rb"))
        self.__log_prior = params['log_prior']
        self.__log_likelihood = params['log_likelihood']

    def load(self):
        self.__load_data_from_files()


