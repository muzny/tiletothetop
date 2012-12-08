from random import randrange
import urllib, urllib2

from django.shortcuts import render_to_response
from django.http import HttpResponse, HttpResponseRedirect
from django.utils import simplejson
from django.template import RequestContext
from django.core.urlresolvers import reverse
from django.contrib.auth import logout as auth_logout, login as auth_login, authenticate
from django.contrib.auth.models import User
from django.db.models import Max, Min
from django.conf import settings

from tiletothetop.models import Word, Tag, CustomList, CustomWord, UserProfile, GameHistory
from tiletothetop.forms import RegistrationForm, LoginForm, CustomListForm, CustomWordsInlineFormSet, CustomRecoveryForm

from social_auth.models import UserSocialAuth
from password_reset.views import Recover


def game(request):
    """Renders the main page, with optional bound forms and errors, if they exist. Otherwise
    it renders blank forms.
    """
    lform = get_and_delete(request.session, 'lform', LoginForm())
    rform = get_and_delete(request.session, 'rform', RegistrationForm())
    lform_errors = get_and_delete(request.session, 'lform_errors', None)
    rform_errors = get_and_delete(request.session, 'rform_errors', None)

    get_and_delete(request.session, 'custom_list_instance', None)
    cl = CustomList()
    clform = CustomListForm(instance=cl)
    cwformset = CustomWordsInlineFormSet(instance=cl, prefix='cw')

    # available lists to edit / use in game
    lists = []
    if (request.user.is_authenticated()):
        lists = CustomList.objects.filter(user=request.user)

    # tags that have at least one word associated with them
    tags = Tag.objects.raw('''select * from tiletothetop_tag t
                              where exists
                                (select wt.id from tiletothetop_word w, tiletothetop_word_tags wt
                                where w.id= wt.word_id and t.id=wt.tag_id)
                              order by t.name''');


    context = {'login_form' : lform, 'registration_form' : rform, 'login_errors' : lform_errors, 'registration_errors' : rform_errors,
               'customlist_form' : clform, 'customwords_formset' : cwformset, 'custom_lists' : lists, 'tags' : tags, 'debug_mode' : settings.DEBUG}
    return render_to_response('game.html', context, context_instance=RequestContext(request))


##############################################################
# AJAX Services                                              #
##############################################################

def static_words(request):
    if not request.is_ajax() or request.method != "GET":
        return HttpResponse(status=400)

    data = []
    gameID = int(request.GET["id"])
    game = GameHistory.objects.filter(id=gameID)[0]
    if (game.mode == "static"):
        return HttpResponse(status=400)
    elif (game.mode == "custom"):
        words = CustomWord.objects
    else:
        words = Word.objects
    for curID in game.ids.split(","):
        word = words.filter(id=curID)[0];
        if not word:
            return HttpResponse(status=400)

        data.append({'word': word.word,
                     'definition': word.definition,
                     'speech': word.part_of_speech})

    rtn_obj = {}
    rtn_obj["mode"] = "static"
    rtn_obj["words"] = data

    return HttpResponse(simplejson.dumps(rtn_obj), mimetype="application/json")

def random_words(request):
    if not request.is_ajax() or request.method != "GET":
        return HttpResponse(status=400)

    MAXWORDS = 20
    num_words = int(request.GET["word_count"])
    num_words = max(min(num_words, MAXWORDS), 0)

    words = Word.objects.all()

    if "max_wordlen" in request.GET:
        max_wordlen = int(request.GET["max_wordlen"])
        # compatibility warning: where clause is psql-specific
        words_maxlen = words.extra(where=["CHAR_LENGTH(word) <= %d" % max_wordlen])
        # performance issue to have a bunch of db hits to ensure numwords length??
        if (words_maxlen.count() >= num_words):
            words = words_maxlen

    # ensure that tag returns at least num_words, otherwise ignore
    if "tag_filter" in request.GET:
        tag_filter = int(request.GET["tag_filter"])
        words_tag = words.filter(tags__in=[tag_filter]);
        if (words_tag.count() >= num_words):
            words = words_tag

    # if we recieved a difficulty, filter around that difficulty
    if "difficulty" in request.GET:
        difficulty = float(request.GET["difficulty"])
        # clamp difficulty to the current range
        min_diff = Word.objects.aggregate(Min("difficulty"))['difficulty__min']
        max_diff = Word.objects.aggregate(Max("difficulty"))['difficulty__max']
        difficulty = max(min(difficulty, max_diff), min_diff)
        step = 2
        count = 0
        # expand difficulty range until we return at least num_words
        range_diff = max_diff - min_diff
        while (count < num_words and step < range_diff):
            words_diff = (words
                    .filter(difficulty__gte=difficulty-step)
                    .filter(difficulty__lte=difficulty+step))
            count = words_diff.count()
            step *= 2
        if (count >= num_words):
            words = words_diff

    words_size = words.count()

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

    rtn_obj = {}
    rtn_obj["mode"] = "random"
    rtn_obj["words"] = data

    return HttpResponse(simplejson.dumps(rtn_obj), mimetype="application/json")

def edit_customlist(request):
    if not request.user.is_authenticated() or not request.is_ajax() or request.method != 'GET':
        return HttpResponse(status=400)

    # get forms to edit requested list
    list_id = int(request.GET['custom_list_id'])
    try:
        cl = CustomList.objects.get(id=list_id)
        if cl.user != request.user:
            return HttpResponse(status=400)
        request.session['custom_list_instance'] = cl
    except CustomList.DoesNotExist:
        # return new form
        cl = CustomList()
        get_and_delete(request.session, 'custom_list_instance', None)

    clform = CustomListForm(instance=cl)
    cwformset = CustomWordsInlineFormSet(instance=cl, prefix='cw')

    context = { 'customlist_form' : clform, 'customwords_formset' : cwformset }
    # TODO don't want to render entire page
    #result = render_block_to_string('wordlists.html', 'custom_wordlists_form', context)
    #return HttpResponse(result)
    return render_to_response('wordlists.html', context, context_instance=RequestContext(request))

def custom_words(request):
    if not request.user.is_authenticated() or not request.is_ajax() or request.method != 'GET':
        return HttpResponse(status=400)

    id =int(request.GET['id'])
    list = CustomList.objects.get(id=id)
    wordSet = CustomWord.objects.filter(custom_list=list)

    num_words = min(len(wordSet), int(request.GET['num_words']))
    words = wordSet.order_by('?')[:num_words]

    data = []
    for word in words:
        data.append({'word': word.word,
                     'definition': word.definition,
                     'speech': word.part_of_speech})

    rtn_obj = {}
    rtn_obj["mode"] = "custom"
    rtn_obj["words"] = data

    return HttpResponse(simplejson.dumps(rtn_obj), mimetype="application/json")

def get_leaderboard(request):
    if not request.is_ajax() or request.method != 'GET':
        return HttpResponse(status=400)

    count = 10

    if 'count' in request.GET:
        count = request.GET['count']

    leaders = UserProfile.objects.order_by('-total_score')[:count]

    rank = 0
    count = 1 # number of people at current rank
    last = -1 # last unique score seen, used to determine ties
    data = []
    for leader_profile in leaders:
        # handle ties
        score = leader_profile.total_score
        if score != last:
            last = score
            rank += count
            count = 1
        else:
            count += 1

        data.append({'user': leader_profile.user.username,
                     'rank': rank,
                     'score': score})

    return HttpResponse(simplejson.dumps(data), mimetype='application/json')

def get_user_rank(request):
    if not request.is_ajax() or request.method != 'GET':
        return HttpResponse(status=400)

    if not request.user.is_authenticated():
        return HttpResponse(status=204)

    leaders = UserProfile.objects.order_by('-total_score')

    rank = 0
    count = 1
    last = -1
    data = {}
    for index, profile in enumerate(leaders):
        # handle ties
        score = profile.total_score
        if score != last:
            last = score
            rank += count
            count = 1
        else:
            count += 1

        if profile.user == request.user:
            data['rank'] = rank
            data['score'] = score

    return HttpResponse(simplejson.dumps(data), mimetype='application/json')


##############################################################
# User Custom Words Views                                    #
##############################################################

# ajax vs. redirect??
def save_customlist(request):
    if not request.user.is_authenticated() or request.method != 'POST':
        return HttpResponse(status=400)

    if 'custom_list_instance' in request.session:
        cl = request.session['custom_list_instance']
        if cl.user != request.user:
            return HttpResponse(status=400)
        clform = CustomListForm(request.POST, instance=cl)
    else:
        clform = CustomListForm(request.POST)

    if clform.is_valid():
        cl = clform.save(commit=False)
        cl.user = request.user
        cwformset = CustomWordsInlineFormSet(request.POST, instance=cl, prefix='cw')
        if cwformset.is_valid():
            cl.save()
            cws = cwformset.save(commit=False)
            for cw in cws:
                cw.custom_list = cl
                cw.save()
            return HttpResponseRedirect(reverse('game'))
        else:
            return HttpResponse(content='cw formset not valid: %s\n list: %s' % (cwformset.errors, cl), status=400)
    # TODO better error handling
    return HttpResponse(content='cl form not valid: %s' % (clform.errors), status=400)

def delete_customlist(request):
    if not request.user.is_authenticated() or request.method != 'POST' or not 'custom_list_instance' in request.session:
        return HttpResponse(status=400)

    cl = request.session['custom_list_instance']
    if cl.user != request.user:
        return HttpResponse(status=400)
    cws = CustomWord.objects.filter(custom_list=cl)

    cws.delete()
    cl.delete()

    return HttpResponseRedirect(reverse('game'))


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

class RecoverView(Recover):
    form_class = CustomRecoveryForm  # to disallow social users from attempting password reset
    search_fields = ['username']
recover = RecoverView.as_view()

##############################################################
# User Data Views                                            #
##############################################################

def push_game_data(request):
    # State Checks
    if not request.user.is_authenticated():
        return HttpResponse(status=204)
    if not request.method == 'POST':
        return HttpResponse(status=405)

    new_score = int(request.POST['score'])

    wordArray = request.POST.getlist('words[]')
    defnArray = request.POST.getlist('definitions[]')
    ids = []

    # Make a new GameHistory object
    new_game = GameHistory(
                            user = request.user,
                            score = new_score,
                            word_difficulties = 0,
                            mode = request.POST['mode']
                        )

    if not request.POST['mode'] == "static":
        if request.POST['mode'] == "custom":
            words = CustomWord.objects
        else:
            words = Word.objects

        for index in range(len(wordArray)):
            wordObject = words.filter(word=wordArray[index], definition=defnArray[index])[0]
            ids.append(str(wordObject.id))

        new_game.ids = ",".join(ids)

    # And push it to the database
    new_game.save()

    profile = request.user.get_profile()
    profile.games_played += 1
    profile.total_score += new_score
    profile.save()

    return HttpResponse(simplejson.dumps({'id': new_game.id}), status=201)

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
    is_fb_user = False
    if user.social_auth.filter(provider='facebook'):
        is_fb_user = True

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
            'is_facebook_user': is_fb_user,
            'last_login': str(user.last_login),
            'games_played': games_played
        })

    return HttpResponse(simplejson.dumps(userData), mimetype="application/json")


def post_to_facebook(request):

    instance = UserSocialAuth.objects.filter(provider='facebook', user=request.user)[0]

    data = {}
    data['message'] = request.POST['message']
    # switch lines to enable dev testing
    data['link'] = request.POST['link']
    #data['link'] = 'http://tiletothetop.herokuapp.com/'
    data['access_token'] = instance.tokens['access_token']
    data['name'] = "Tile To The Top"

    headers = {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
    }

    jsondata = urllib.urlencode(data)
    url = urllib2.Request("https://graph.facebook.com/" + request.user.username + "/feed/", jsondata, headers)
    status = 400

    try:
        urllib2.urlopen(url)
        data['success'] = True
        status = 200
    except urllib2.URLError, e:
        status = e.code
        print e.code
        print e.read()

    return HttpResponse(status=status)


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

