from random import randrange

from django.shortcuts import render_to_response
from django.http import HttpResponse, HttpResponseRedirect
from django.utils import simplejson
from django.template import RequestContext
from django.core.urlresolvers import reverse
from django.contrib.auth import logout as auth_logout, login as auth_login, authenticate
from django.contrib.auth.models import User
from django.core.context_processors import csrf

from tiletothetop.models import Word, Tag, UserProfile, GameHistory
from tiletothetop.forms import RegistrationForm, LoginForm


def game(request):
    """Renders the main page, with optional bound forms and errors, if they exist. Otherwise
    it renders blank forms.
    """
    lform = get_and_delete(request.session, 'lform', LoginForm())
    rform = get_and_delete(request.session, 'rform', RegistrationForm())
    lform_errors = get_and_delete(request.session, 'lform_errors', None)
    rform_errors = get_and_delete(request.session, 'rform_errors', None)

    tags = Tag.objects.all()

    context = {'login_form' : lform, 'registration_form' : rform, 'login_errors' : lform_errors, 'registration_errors' : rform_errors,
                'tags' : tags }
    return render_to_response('game.html', context, context_instance=RequestContext(request))


##############################################################
# AJAX Services                                              #
##############################################################

def static_words(request):
    pass

def random_words(request):
    if not request.is_ajax() or request.method != "GET":
        return HttpResponse(status=400)

    MAXWORDS = 20
    num_words = int(request.GET["word_count"])
    num_words = min(num_words, MAXWORDS)

    # if we recieved a difficulty, filter around that difficulty
    # fails at the moment because the difficulty fields are empty in the database
    if "difficulty" in request.GET:
        difficulty = float(request.GET["difficulty"])
        words = (Word.objects
                .filter(difficulty__gt=difficulty-2)
                .filter(difficulty__lt=difficulty+2))
    else:
        words = Word.objects.all()
    words_size = len(words)

    # in the edge case where we have less than 20 words in the result set
    if words_size < num_words:
        num_words = words_size

    # get a random number, use it as an index for the return set of words
    # if its not in the data set, add it, and repeat
    data = []
    while(len(data) < num_words):
        random_word = words[randrange(words_size)]
        is_added = False
        for word in data:
            if word['word'] == random_word.word:
                is_added = True
        if not is_added:
            data.append({'word': random_word.word,
                         'definition': random_word.definition,
                         'speech': random_word.part_of_speech})

    return HttpResponse(simplejson.dumps(data), mimetype="application/json")



##############################################################
# User Account Views                                         #
##############################################################

def login(request):
    if request.user.is_authenticated() or request.method != 'POST':
        return HttpResponseRedirect(reverse('game'))

    form = LoginForm(request.POST)
    if not form.is_valid():
        return render_main_page(request, lform=form) # rerender the bound form with errors

    user = authenticate(username=form.cleaned_data['username'], password=form.cleaned_data['password'])
    if user:
        auth_login(request, user)
        return HttpResponseRedirect(reverse('game'))
    else:
        return render_main_page(request, lform=form, lform_errors=['Invalid Password'])

def logout(request):
    auth_logout(request)
    return HttpResponseRedirect(reverse('game'))

def register(request):
    if request.user.is_authenticated() or request.method != 'POST':
        return HttpResponseRedirect(reverse('game'))

    form = RegistrationForm(request.POST)
    if not form.is_valid():
        return render_main_page(request, rform=form)

    # setup our new user and user profile
    user = User.objects.create_user(username=form.cleaned_data['username'],
                                    email=form.cleaned_data['email'],
                                    password=form.cleaned_data['password1'])
    user.save()

    user = authenticate(username=form.cleaned_data['username'], password=form.cleaned_data['password1'])
    auth_login(request, user)

    return HttpResponseRedirect(reverse('game'))



##############################################################
# User Data Views                                            #
##############################################################

def push_game_data(request):
    # State Checks
    if not request.user.is_authenticated():
        return HttpResponse(status=204)
    if not request.method == 'GET':
        return HttpResponse(status=405)

    # Make a new GameHistory object
    new_game = GameHistory(
                            user = request.user,
                            score = request.GET["score"],
                            word_difficulties = 0
                        )
    # And push it to the database
    new_game.save()

    profile = request.user.get_profile()
    profile.games_played += 1
    profile.save()

    return HttpResponse(status=201)

def get_user_data(request):
    # State Checks
    if not request.user.is_authenticated():
        return HttpResponse(status=401)
    if not request.method == 'GET':
        return HttpResponse(status=405)

    # Get the user, fetch games played from server,
    # make a new dictionary object, and return it
    # NOTE: currently returns all returnable fields (minus pwd)
    user = request.user
    games_played = UserProfile.objects.filter(user__username=request.user)[0].games_played
    userData = ({
            'username': user.username,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email,
            'date_joined': str(user.date_joined),
            'id': user.id,
            'is_active': user.is_active,
            'is_staff': user.is_staff,
            'is_superuser': user.is_superuser,
            'last_login': str(user.last_login),
            'games_played': games_played
        })

    return HttpResponse(simplejson.dumps(userData), mimetype="application/json")


##############################################################
# Utility Methods                                            #
##############################################################

def render_main_page(request, lform=None, rform=None, lform_errors=None, rform_errors=None):
    """Utility method to redirect and render the main page with the given bound forms and their
    associated errors. lform_errors and rform_errors are additional errors that can't be detected
    in their respective form's clean methods.
    """
    # store them in the session data temporarily until we redirect
    # TODO - is there a better way to do this?
    request.session['lform'] = lform
    request.session['rform'] = rform
    request.session['lform_errors'] = lform_errors
    request.session['rform_errors'] = rform_errors
    # we want to redirect so we're not still at one of the user auth urls if authentication fails
    return HttpResponseRedirect(reverse('game'))

def get_and_delete(d, key, default):
    """Utility method to remove an entry for a dict and return it, returning the default value
    if d[key] doesn't exist of if it maps to None. Works similar to d.get(key, default) except that it
    removes the mapping as well. Used mainly to get and remove session data.
    """
    if key in d:
        result = d[key]
        del d[key]
        if result is not None:
            return result
        else:
            return default
    else:
        return default

