from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save

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

# Record of each games completed successfully
class GameHistory(models.Model):
    user  = models.ForeignKey(User)
    score = models.IntegerField(default=0)

    # list of difficulty values of words solved in the game
    # (will probably replace with something more usable later
    # same as a string, just does extra validation on comma separation)
    # to use as tuple: eval(game_history_instance.word_difficulties)
    word_difficulties = models.CommaSeparatedIntegerField(max_length=256)

    def __unicode__(self):
        return "User %d; Score %d; Word Difficulties %s" % (self.user.id, self.score, self.word_difficulties)

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
