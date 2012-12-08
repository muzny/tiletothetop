# Tasks dealing with heroku. You may need to do a `heroku login` before
# attempting these commands.
from fabric.api import *
from heroku_settings import *

HEROKU_ADDONS = (
    'pgbackups',            # db backups
    'newrelic:standard'     # monitoring
)

HEROKU_CONFIGS = (
    'FB_APP_ID=%s' % FB_APP_ID,
    'FB_API_SECRET=%s' % FB_API_SECRET,
    'EMAIL_HOST_PASSWORD=%s' % EMAIL_HOST_PASSWORD,
)

def deploy():
    """Deploy the app to Heroku"""
    backup()
    local('git push heroku master -f')
    local('heroku run ./manage.py syncdb')
    local('heroku run ./manage.py migrate')

def test():
    """Run tests"""
    local('./manage.py test tiletothetop')

def bootstrap():
    """Bootstrap and deploy a fresh Heroku app"""
    for addon in HEROKU_ADDONS:
        cont('heroku addons:add %s' %addon,
             "Couldn't add %s to your Heroku app, continue anyway?" %config)

    for config in HEROKU_CONFIGS:
        cont('heroku config:add %s' % config,
             "Couldn't add %s to your Heroku app, continue anyway?" % config)

    deploy()

def backup():
    """Backup the live database"""
    local('heroku pgbackups:capture')

def view_backups():
    """Show the available database backups"""
    local('heroku pgbackups')
    print('To restore:  heroku pgbackups:restore [db to restore to] [backup id]')

def monitor():
    """Launch the url of the monitoring app"""
    local('heroku addons:open newrelic')

# Helper function
def cont(cmd, message):
    """Given a command, `cmd`, and a message, `message`, allow a user to
    either continue or break execution if errors occur while executing `cmd`.
    """
    with settings(warn_only=True):
        result = local(cmd, capture=True)

    if message and result.failed and not confirm(message):
        abort('Stopped execution per user request.')


