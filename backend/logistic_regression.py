import pickle
from nltk.corpus import twitter_samples
import numpy as np
import datetime
from utils import preprocess_text, build_word_freq_dict


class LogisticRegression:
    def __init__(self):
        self.__word_freqs = {}
        self.__theta = 0

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
        :return: x: A feature vector of dimension (1, 3) for the input text
        """

        # Preprocess text, removing stop words and punctuation, removing Twitter-specific features and stemming the words from the input text
        words_clean = preprocess_text(text)

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

        # Split data for training
        train_positive = all_positive_tweets[:4000]
        train_negative = all_negative_tweets[:4000]
        train_x = train_positive + train_negative

        # Create numpy array for the labels
        train_y = np.append(np.ones((len(train_positive), 1)), np.zeros((len(train_negative), 1)), axis=0)
        result_file.write("train_y.shape = " + str(train_y.shape) + "\n")

        # Create word frequency dictionary
        self.__word_freqs = build_word_freq_dict(train_x, train_y)

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

    def test_model(self):
        """
        Test the accuracy of the trained logistic regression algorithm
        :return: accuracy: The accuracy of the algorithm, calculated as being the proportion of correctly calculated tweets out of the entire sample size
        """
        # Create a file for writing the results of the testing; also mark the results with a timestamp, to keep track of tests
        timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        result_file = open("testing_results.txt", "a")
        result_file.write("Logistic Regression Testing - " + timestamp + "\n")

        # Retrieve the lists of positive and negative tweets from the NLTK sample
        all_positive_tweets = twitter_samples.strings('positive_tweets.json')
        all_negative_tweets = twitter_samples.strings('negative_tweets.json')

        # Split the data into data for testing
        test_positive = all_positive_tweets[4000:]
        test_negative = all_negative_tweets[4000:]

        test_x = test_positive + test_negative
        test_y = np.append(np.ones((len(test_positive), 1)), np.zeros((len(test_negative), 1)), axis=0)
        result_file.write("test_y.shape = " + str(test_y.shape) + "\n")

        # Write the values of the weights used for calculation to the result file
        result_file.write(f"The weights used for prediction is {[round(t, 8) for t in np.squeeze(self.__theta)]}" + "\n")

        # Create a list for storing prediction results
        y_hat = []

        for text in test_x:
            # Get the label prediction for the text (between 0 and 1, with < 0.5 meaning negative, and > meaning positive sentiments)
            y_prediction = self.__predict_text(text)

            if y_prediction > 0.5:
                # Positive prediction
                y_hat.append(1)
            else:
                # Negative prediction
                y_hat.append(0)

        # Type conversions: y_hat is a list and test_y is an array -> Convert them both to list objects, so that equality operator can be used for comparison
        y_hat = np.array(y_hat)
        copy_test_y = test_y.reshape(-1)

        # Calculate the accuracy of prediction
        accuracy = np.sum((copy_test_y == y_hat).astype(int)) / len(copy_test_y)
        result_file.write("Accuracy: " + str(accuracy))
        result_file.close()

        return accuracy

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
