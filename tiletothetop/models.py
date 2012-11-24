from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save

"""
Standard game dictionary
"""

class BasicWord(models.Model):
    word = models.CharField(max_length=50)
    part_of_speech = models.CharField(max_length=10)
    definition = models.CharField(max_length=200)

    def __unicode__(self):
        return "%s -- (%s) %s" % (self.word, self.part_of_speech, self.definition)

    class Meta:
        abstract = True

class Tag(models.Model):
    name = models.CharField(max_length=50)

    def __unicode__(self):
        return self.name

class Word(BasicWord):
    tags = models.ManyToManyField(Tag)
    difficulty = models.DecimalField(max_digits=15,decimal_places=10,null=True)

    def __unicode__(self):
        return "%s [%s] %d" % (super(Word, self).__unicode__(),
                ", ".join([tag.name for tag in self.tags.all()]), self.difficulty)


"""
Custom word lists
"""

class CustomList(models.Model):
    user = models.ForeignKey(User)
    name = models.CharField(max_length=50, verbose_name="List Name")
    tags = models.ManyToManyField(Tag)
    is_public = models.BooleanField(default=False, 
                help_text="Whether this list can be viewed by anyone.")

    def __unicode__(self):
        return "User: %d; List: %s [%s] (%s)" % (self.user.id, self.name, 
               ", ".join([tag.name for tag in self.tags.all()]), self.is_public)

class CustomWord(BasicWord):
    custom_list = models.ForeignKey(CustomList)

    def __unicode__(self):
        return "%s [%d]" % (super(CustomWord, self).__unicode__(), self.custom_list.id)



# Record of each game completed successfully
class GameHistory(models.Model):
    user  = models.ForeignKey(User)
    score = models.IntegerField(default=0)

    # list of difficulty values of words solved in the game
    # (will probably replace with something more usable later
    # same as a string, just does extra validation on comma separation)
    # to use as tuple: eval(game_history_instance.word_difficulties)
    word_difficulties = models.CommaSeparatedIntegerField(max_length=256)

    def __unicode__(self):
        return "User %d; Score %d; Word Difficulties %s" % \
            (self.user.id, self.score, self.word_difficulties)

#Our site-specific user profile data goes here
class UserProfile(models.Model):
    user = models.OneToOneField(User)  # provides our authentication info
    games_played = models.IntegerField(default=0)
    total_score = models.IntegerField(default=0)

    def __unicode__(self):
        return self.user.__unicode__()

# Hook into User so that user profiles are automatically created for new users
def create_user_profile(sender, instance, created, **kwargs):
    if created:  # a new User was created, let's give him/her a profile
        UserProfile.objects.create(user=instance)

post_save.connect(create_user_profile, sender=User)
