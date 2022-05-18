import re
import string
import pickle
import nltk, ssl
from nltk.corpus import stopwords, twitter_samples
from nltk.stem import PorterStemmer
from nltk.tokenize import TweetTokenizer
import numpy as np
import datetime


class LogisticRegression:
    def __init__(self):
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

    @staticmethod
    def __preprocess_text(text):
        """
        Preprocess the given text, removing URLs, Links, Retweets and Hashtags, ignoring stopwords and punctuation, and stemming each word
        :param string text: The text to be preprocessed
        :return []: A list of all tokens from the input string
        """
        # Remove Twitter Stock Market Tickers like $GE
        text = re.sub(r'\$\w*', '', text)

        # Remove Retweet text like "RT"
        text = re.sub(r'^RT[\s]+', '', text)

        # Remove Hyperlinks
        text = re.sub(r'https?:\/\/.*[\r\n]*', '', text)

        # Remove the Hashtag symbol -> Hashtag keywords are still kept, only # symbol is removed
        text = re.sub(r'#', '', text)

        # Use the Tweet Tokenizer to split the text into tokens
        #       - preserve_case: Flag indicating whether to preserve the capitalisation of the text
        #       - strip_handles: Flag indicating whether to remove Twitter handles in the text
        #       - reduce_len: Flag indicating whether to replace repeated character sequences of length 3 or greater with sequences of length 3
        tokenizer = TweetTokenizer(preserve_case=False, strip_handles=True, reduce_len=True)
        text_tokens = tokenizer.tokenize(text)

        stopwords_english = stopwords.words('english')
        stemmer = PorterStemmer()

        # Remove stop words and punctuation
        text_clean = []
        for word in text_tokens:
            if word not in stopwords_english and word not in string.punctuation:
                text_clean.append(stemmer.stem(word))

        return text_clean

    def __build_word_freq_dict(self, texts, labels):
        """
        :param list texts: A list of texts to be preprocessed
        :param nparray labels: The labels of the input text
        :return: {}: A dictionary where each word in the input text is associated to its number of occurrences in the text
        """

        # Convert NP Array to List since the ZIP function requires an iterable structure
        labels_list = np.squeeze(labels).tolist()

        # Start with an empty dictionary and populate it by looping over the all the texts in the list, and then in every word from each text
        word_freqs = {}
        for label, text in zip(labels_list, texts):
            for word in self.__preprocess_text(text):
                pair = (word, label)
                if pair in word_freqs:
                    word_freqs[pair] += 1
                else:
                    word_freqs[pair] = 1

        return word_freqs

    @staticmethod
    def __sigmoid(z):
        """
        :param z: A real number, in the range [-infinite, +infinite]
        :return: A value between [0, 1]
        """
        return 1 / (1 + np.exp(-z))

    def __gradient_descent(self, x, y, theta, alpha, num_iterations):
        """
        :param x: Matrix of features
        :param y: Corresponding labels of the input matrix x / target variable
        :param theta: Weight vector
        :param alpha: Learning rate
        :param num_iterations: Number of iterations the model is trained for
        :return: J: The final cost
                 theta: The adjusted / final weight vector
        """
        m = x.shape[0]
        J = 0
        for i in range(0, num_iterations):
            # Get the dot product of x and theta
            z = np.dot(x, theta)

            # Get the sigmoid of h
            h = self.__sigmoid(z)

            # Calculate the value of the cost function
            J = -1. / m * (np.dot(y.transpose(), np.log(h)) + np.dot((1 - y).transpose(), np.log(1 - h)))

            # Update the weights theta
            theta = theta - (alpha / m) * np.dot(x.transpose(), (h - y))

        return float(J), theta

    def __extract_features(self, text):
        """
        :param string text: A sequence of words to be analyzed
        :param dict word_freqs: A dictionary corresponding to the frequency of each word in the input text
        :return: x: A feature vector of dimension (1, 3) for the input text
        """

        # Preprocess text, removing stop words and punctuation, removing Twitter-specific features and stemming the words from the input text
        words_clean = self.__preprocess_text(text)

        # Initialize a vector full of 0 values, of dimension 1 x 3
        x = np.zeros((1, 3))

        # Bias term is set to 1
        x[0, 0] = 1

        # Loop through each word in the text
        for word in words_clean:
            # Increment the word count for the positive label 1
            x[0, 1] += self.__word_freqs.get((word, 1.0), 0)

            # Increment the word count for the negative label 0
            x[0, 2] += self.__word_freqs.get((word, 0.0), 0)

        return x

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

        # Write the shapes of the NP arrays for the testing and training data
        result_file.write("train_y.shape = " + str(train_y.shape) + "\n")
        result_file.write("test_y.shape  = " + str(test_y.shape) + "\n")

        # Create word frequency dictionary
        self.__word_freqs = self.__build_word_freq_dict(train_x, train_y)

        # Write the dictionary size
        result_file.write("Word Frequency Dictionary size: " + str(len(self.__word_freqs.keys())) + "\n")

        # Collect the features 'x' and stack them into a matrix 'X'
        X = np.zeros((len(train_x), 3))
        for i in range(len(train_x)):
            X[i, :] = self.__extract_features(train_x[i])

        # Training labels corresponding to X
        Y = train_y

        # Apply gradient descent
        J, self.__theta = self.__gradient_descent(X, Y, np.zeros((3, 1)), 1e-9, 1500)

        # Write the training cost and the weights that will be used for the prediction
        result_file.write(f"The cost after training is {J:.8f}." + "\n")
        result_file.write(f"The resulting vector of weights is {[round(t, 8) for t in np.squeeze(self.__theta)]}" + "\n")
        result_file.write("\n")

        result_file.close()

    def __write_results_to_file(self):
        # Write the word frequency dictionary into a separate json file
        pickle.dump(self.__word_freqs, open("word_freqs.json", "wb"))

        # Write the prediction parameters into a separate file
        params = {'theta': self.__theta}
        pickle.dump(params, open("parameters.json", "wb"))

    def execute(self):
        self.__train_model()
        self.__write_results_to_file()

    def __load_data_from_files(self):
        # Read the word frequency dictionary from the json file
        self.__word_freqs = pickle.load(open("word_freqs.json", "rb"))

        # Read the parameters from the appropriate file
        self.__theta = pickle.load(open("parameters.json", "rb"))["theta"]

    def load(self):
        self.__load_data_from_files()

    def __predict_text(self, text):
        # Extract the features of the text and store them into x
        x = self.__extract_features(text)

        # Make the prediction by applying the sigmoid function using the calculated weights
        return self.__sigmoid(np.dot(x, self.__theta))

    def predict_text_polarity(self, text):
        prediction = self.__predict_text(text)

        if prediction > 0.5:
            return "POSITIVE"
        else:
            if prediction == 0.5:
                return "NEUTRAL"
            else:
                return "NEGATIVE"










