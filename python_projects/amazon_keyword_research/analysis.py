import nltk
import string 
from collections import Counter
from nltk.corpus import stopwords 
from nltk.tokenize import word_tokenize 

# Download required NLTK data if not present
try:
    nltk.data.find('tokenizers/punkt_tab')
except LookupError:
    nltk.download('punkt_tab')

try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords')

STOP_WORDS = set(stopwords.words("english")) 

def analyze_keywords(titles, top_n=15): 
    words = [] 
    for title in titles: 
        tokens = word_tokenize(title.lower()) 
        cleaned = [ 
            token.strip(string.punctuation) 
            for token in tokens 
            if token not in STOP_WORDS 
            and token.isalpha() 
            and len(token) > 2 
        ] 
        words.extend(cleaned) 
    return Counter(words).most_common(top_n)