from django.conf.urls import patterns, url

urlpatterns = patterns('tiletothetop.views',
    url(r'^/?$', 'game', name='game'),

    # these two route ajax calls to the appropraite views (word services)
    url(r'^random-words/$', 'random_words', name='random_words'),
    url(r'^static-words/$', 'static_words', name='static_words'),
)
