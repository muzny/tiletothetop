from django.shortcuts import render_to_response
from django.http import HttpResponse
from django.utils import simplejson
from game.models import Word


def game(request):
    return render_to_response('game.html')

def static_words(request):
    pass

def random_words(request):
    if not request.is_ajax() or request.method != "GET":
        return HttpResponse(status=400)

    numWords = request.POST.get("word_count", 20)
    count = Word.objects.all().count()
    numWords = min(numWords, 20, count) # max=20 for now

    # get numWords random words
    # Note: this can be really slow with a large db
    words = Word.objects.all().order_by('?')[:numWords]

    data = [dict(word=w.word, definition=w.definition, speech=w.part_of_speech)
            for w in words]
    return HttpResponse(simplejson.dumps(data), mimetype="application/json")


