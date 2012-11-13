"""
This file demonstrates writing tests using the unittest module. These will pass
when you run "manage.py test".

Replace this with more appropriate tests for your application.
"""

from django.test import TestCase
from django.test.client import Client

class SimpleTest(TestCase):
    def test_basic_addition(self):
        """
        Tests that 1 + 1 always equals 2.
        """
        self.assertEqual(1 + 1, 2)

class RandomWordsTest(TestCase):
    def setUp(self):
        self.client = Client()
    
    def __get_words(self, n, difficulty=None):
        # create properly formed request
        args = {"word_count" : n}
        if difficulty:
            args["difficulty"] = difficulty
        response = self.client.get("/random-words/", args,
                HTTP_X_REQUESTED_WITH='XMLHttpRequest')
        self.assertEqual(response.status_code, 200)
        return eval(response.content)
    
    def test_expected_num_words(self):
        """
        Pre: test db has at least 20 distinct words
        """
        for n in range(22): # max words possible = 20
            words = self.__get_words(n);
            if n < 20:
                self.assertEqual(len(words), n)
            else:
                self.assertEqual(len(words), 20)
    
    def test_no_duplicates(self):
        # test various request lengths
        for n in range(22):
            words = self.__get_words(n)
            # assert no duplicates
            for i, word in enumerate(words):
                w = word['word']
                for other in words[i+1:]:
                    self.assertNotEqual(w, other['word'])
    
    def test_difficulty_not_existant(self):
        """
        Pre: negative difficulties are non-existant in db
        """
        words = self.__get_words(4, -1)
        self.assertEqual(len(words), 0) # returning 0 words is valid
        
    def test_difficulty_exists(self):
        """
        Pre: at least 4 words with difficulty 75 +- 2 exist
        """
        words = self.__get_words(4, 75)
        self.assertEqual(len(words), 4)
