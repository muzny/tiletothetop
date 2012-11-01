from django.db import models

class Tag(models.Model):
    name = models.CharField(max_length=50)
    
    def __unicode__(self):
        return self.name

class Word(models.Model):
    word = models.CharField(max_length=50)
    definition = models.CharField(max_length=200)
    part_of_speech = models.CharField(max_length=10)
    tags = models.ManyToManyField(Tag)
    difficulty = models.DecimalField(max_digits=15,decimal_places=10,null=True)
    
    """
    class Meta:
        unique_together = ("word", "part_of_speech")
    """

    def __unicode__(self):
        return "%s -- (%s) %s [%s]" % (self.word, self.part_of_speech, self.definition,
                                        ", ".join([tag.name for tag in self.tags.all()]))
