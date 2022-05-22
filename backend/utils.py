import re
import string
import ssl
import nltk
import numpy as np
from nltk.corpus import stopwords
from nltk.stem import PorterStemmer
from nltk.tokenize import TweetTokenizer


def preprocess_text(text):
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


def download_nltk_samples():
    """
    Download the Twitter Sample json files, as well as the Stopwords json files, into the project structure.
    This method only needs to be executed once per project, as the downloaded files will persist in the project structure.
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


def build_word_freq_dict(texts, labels):
    """
    Take a list of texts, clean all of them through the preprocessing function, and return a frequency dictionary for all the words
    :param texts: A list of texts to be processed
    :param labels:  A list corresponding to the sentiment of each text (0 for negative and 1 for positive)
    :return: A dictionary mapping each pair (word, label) to its frequency
    """

    # Convert NP Array to List since the ZIP function requires an iterable structure
    labels_list = np.squeeze(labels).tolist()

    # Start with an empty dictionary and populate it by looping over the all the texts in the list, and then in every word from each text
    word_freqs = {}
    for label, text in zip(labels_list, texts):
        for word in preprocess_text(text):
            pair = (word, label)
            if pair in word_freqs:
                word_freqs[pair] += 1
            else:
                word_freqs[pair] = 1

    return word_freqs
