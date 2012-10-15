from django.db import models

class Word(models.Model):
    word = models.CharField(max_length=50)
    definition = models.CharField(max_length=200)
    part_of_speech = models.CharField(max_length=10)

    def __unicode__(self):
        return "%s -- (%s) %s" % (self.word, self.part_of_speech, self.definition)

