from logistic_regression import LogisticRegression


tester = LogisticRegression()
tester.load()
print(tester.predict_text_polarity(input("Your text here: ")))