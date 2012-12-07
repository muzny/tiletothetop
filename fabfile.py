# Tasks dealing with heroku. You may need to do a `heroku login` before
# attempting these commands.
from fabric.api import *
from heroku_settings import *

HEROKU_CONFIGS = (
    'FB_APP_ID=%s' % FB_APP_ID,
    'FB_API_SECRET=%s' % FB_API_SECRET,
    'EMAIL_HOST_PASSWORD=%s' % EMAIL_HOST_PASSWORD,
)

def deploy():
    local('git push heroku master -f')
    local('heroku run ./manage.py syncdb')
    local('heroku run ./manage.py migrate')

def test():
    local('./manage.py test tiletothetop')

def bootstrap():
    for config in HEROKU_CONFIGS:
        cont('heroku config:add %s' % config,
            "Couldn't add %s to your Heroku app, continue anyway?" % config)

    deploy()

# Helper function
def cont(cmd, message):
    """Given a command, ``cmd``, and a message, ``message``, allow a user to
    either continue or break execution if errors occur while executing ``cmd``.
    """
    with settings(warn_only=True):
        result = local(cmd, capture=True)

    if message and result.failed and not confirm(message):
        abort('Stopped execution per user request.')


