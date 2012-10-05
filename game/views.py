from django.shortcuts import render_to_response


def game(request):
  return render_to_response('game.html')
