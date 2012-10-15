from django.conf.urls import patterns, url

# Uncomment the next two lines to enable the admin:
# from django.contrib import admin
# admin.autodiscover()

urlpatterns = patterns('game.views',
    url(r'^/?$', 'game', name='game'),

    # these two simply route ajax calls to the appropraite views (word service)
    url(r'^random-words/$', 'random_words', name='random_words'),
    url(r'^static-words/$', 'static_words', name='static_words'),
)
