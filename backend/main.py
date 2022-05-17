import re
import string
import nltk, ssl
from nltk.corpus import stopwords, twitter_samples
from nltk.stem import PorterStemmer
from nltk.tokenize import TweetTokenizer
import numpy as np


# Preprocess a tweet
def preprocess_tweet(tweet):
    stemmer = PorterStemmer()
    stopwords_english = stopwords.words('english')
    # remove stock market tickers like $GE
    tweet = re.sub(r'\$\w*', '', tweet)
    # remove old style retweet text "RT"
    tweet = re.sub(r'^RT[\s]+', '', tweet)
    # remove hyperlinks
    tweet = re.sub(r'https?:\/\/.*[\r\n]*', '', tweet)
    # remove hashtags
    # only removing the hash # sign from the word
    tweet = re.sub(r'#', '', tweet)
    # tokenize tweets
    tokenizer = TweetTokenizer(preserve_case=False, strip_handles=True, reduce_len=True)
    tweet_tokens = tokenizer.tokenize(tweet)

    tweets_clean = []
    for word in tweet_tokens:
        if (word not in stopwords_english and     # remove stopwords
                word not in string.punctuation):  # remove punctuation
            stem_word = stemmer.stem(word)  # stemming word
            tweets_clean.append(stem_word)

    return tweets_clean


# This method will take tweets and their labels as input, go through every tweet, process it, count the occurrence
# of every word in the data set and create a frequency dictionary
def build_freq_dict(tweets, ys):
    # Convert np array to list since zip needs an iterable.
    # The squeeze is necessary or the list ends up with one element.
    # Also note that this is just a NOP if ys is already a list.
    yslist = np.squeeze(ys).tolist()

    # Start with an empty dictionary and populate it by looping over all tweets
    # and over all processed words in each tweet.
    freqs = {}
    for y, tweet in zip(yslist, tweets):
        for word in preprocess_tweet(tweet):
            pair = (word, y)
            if pair in freqs:
                freqs[pair] += 1
            else:
                freqs[pair] = 1

    return freqs


def sigmoid(z):
    h = 1 / (1 + np.exp(-z))

    return h


def gradient_descent(x, y, theta, alpha, num_iters):
    '''
    :param x: matrix of features
    :param y: corresponding labels of the input matrix x / target variable
    :param theta: weight vector
    :param alpha: learning rate
    :param num_iters: number of iterations you want to train your model for
    :return: J: the final cost
             theta: your final weight vector
    '''

    m = x.shape[0]
    for i in range(0, num_iters):
        # get z, the dot product of x and theta
        z = np.dot(x, theta)

        # get the sigmoid of h
        h = sigmoid(z)

        # calculate the cost function
        J = -1. / m * (np.dot(y.transpose(), np.log(h)) + np.dot((1 - y).transpose(), np.log(1 - h)))

        # update the weights theta
        theta = theta - (alpha / m) * np.dot(x.transpose(), (h - y))

    J = float(J)
    return J, theta


def extract_features(tweet, freqs):
    '''
    Input:
        tweet: a list of words for one tweet
        freqs: a dictionary corresponding to the frequencies of each tuple (word, label)
    Output:
        x: a feature vector of dimension (1,3)
    '''
    # process_tweet tokenizes, stems, and removes stopwords
    word_l = preprocess_tweet(tweet)
    # 3 elements in the form of a 1 x 3 vector
    x = np.zeros((1, 3))

    # bias term is set to 1
    x[0, 0] = 1

    # loop through each word in the list of words
    for word in word_l:
        # increment the word count for the positive label 1
        x[0, 1] += freqs.get((word, 1.0), 0)

        # increment the word count for the negative label 0
        x[0, 2] += freqs.get((word, 0.0), 0)

    assert (x.shape == (1, 3))
    return x


def download_nltk_twitter_sample():
    # in order to download the twitter samples, we need an SSL certificate
    try:
        _create_unverified_https_context = ssl._create_unverified_context
    except AttributeError:
        pass
    else:
        ssl._create_default_https_context = _create_unverified_https_context

    nltk.download('twitter_sample')
    nltk.download('stopwords')


def predict_tweet(tweet, freqs, theta):
    # extract the features of the tweet and store it into x
    x = extract_features(tweet, freqs)

    # make the prediction using x and theta
    y_pred = sigmoid(np.dot(x, theta))
    return y_pred


def predict_tweet_polarity(my_tweet, freqs, theta):
    y_hat = predict_tweet(my_tweet, freqs, theta)
    if y_hat > 0.5:
        print('Your sentence expresses a positive sentiment :)')
    else:
        if y_hat == 0.5:
            print('Your sentence expresses a positive sentiment :)')
        else:
            print('Your sentence expresses a negative sentiment :(')


# Creating a set of Positive and Negative tweets
all_positive_tweets = twitter_samples.strings('positive_tweets.json')
all_negative_tweets = twitter_samples.strings('negative_tweets.json')

# Data splitting for training and testing
test_pos = all_positive_tweets[4000:]
train_pos = all_positive_tweets[:4000]
test_neg = all_negative_tweets[4000:]
train_neg = all_negative_tweets[:4000]

train_x = train_pos + train_neg
test_x = test_pos + test_neg

# Create numpy arrays for the labels
train_y = np.append(np.ones((len(train_pos), 1)), np.zeros((len(train_neg), 1)), axis=0)
test_y = np.append(np.ones((len(test_pos), 1)), np.zeros((len(test_neg), 1)), axis=0)

# create frequency dictionary
freqs = build_freq_dict(train_x, train_y)

# check the output
# print("type(freqs) = " + str(type(freqs)))
# print("len(freqs) = " + str(len(freqs.keys())))
#
# print('This is an example of a positive tweet: \n', train_x[0])
# print('\nThis is an example of the processed version of the tweet: \n', preprocess_tweet(train_x[0]))

# collect the features 'x' and stack them into a matrix 'X'
X = np.zeros((len(train_x), 3))
for i in range(len(train_x)):
    X[i, :]= extract_features(train_x[i], freqs)

# training labels corresponding to X
Y = train_y

# Apply gradient descent
J, theta = gradient_descent(X, Y, np.zeros((3, 1)), 1e-9, 1500)
# print(f"The cost after training is {J:.8f}.")
# print(f"The resulting vector of weights is {[round(t, 8) for t in np.squeeze(theta)]}")

my_tweet = input("Add your sentence here: ")
predict_tweet_polarity(my_tweet, freqs, theta)
