from django.conf.urls import patterns, url, include
from django.conf import settings
from django.views.static import serve

urlpatterns = patterns('tiletothetop.views',
    url(r'^/?$', 'game', name='game'),

    # user registration
    url(r'', include('social_auth.urls')),
    url(r'^register/$', 'register', name='register'),
    url(r'^login/$', 'login', name='login'),
    url(r'^logout/$', 'logout', name='logout'),

    # these two route ajax calls to the appropraite views (word services)
    url(r'^random-words/$', 'random_words', name='random_words'),
    url(r'^static-words/$', 'static_words', name='static_words'),

    url(r'^save-customlist/$', 'save_customlist', name='save_customlist'),

    # these two routes get and post user data
    url(r'^push-game-data/$', 'push_game_data', name='push_game_data'),
    url(r'^get-user-data/$', 'get_user_data', name='get_user_data'),

    url(r'^get-leaderboard/$', 'get_leaderboard', name='get_leaderboard'),
    url(r'^get-user-rank/$', 'get_user_rank', name='get_user_rank'),
)


if not settings.DEBUG: # not ideal - just a quick fix to get deployment working
    urlpatterns += patterns('',
        url(r'^static/(?P<path>.*)$', serve, {'document_root': settings.STATIC_ROOT}),
    )

