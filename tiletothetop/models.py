from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save

class Word(models.Model):
    word = models.CharField(max_length=50)
    definition = models.CharField(max_length=200)
    part_of_speech = models.CharField(max_length=10)

    def __unicode__(self):
        return "%s -- (%s) %s" % (self.word, self.part_of_speech, self.definition)

#Our site-specific user profile data
class UserProfile(models.Model):
    user = models.OneToOneField(User)  # provides our authentication info
    games_played = models.IntegerField(default=0)

    def __unicode__(self):
        return self.user.__unicode__()

# Hook into User so that user profiles are automatically created for new users
def create_user_profile(sender, instance, created, **kwargs):
    if created:  # a new User was created, let's give him/her a profile
        UserProfile.objects.create(user=instance)
post_save.connect(create_user_profile, sender=User)
