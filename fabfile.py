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

def compress():
    """Compile and minify our javascript."""
    print('\n\nCompiling/Minifying Javascript\n')
    local('java -jar tools/compiler.jar --js tiletothetop/static/js/account.js ' +
                                       '--js tiletothetop/static/js/board.js ' +
                                       '--js tiletothetop/static/js/definitionarea.js ' +
                                       '--js tiletothetop/static/js/drag.js ' +
                                       '--js tiletothetop/static/js/game.js ' +
                                       '--js tiletothetop/static/js/jquery.formset.min.js ' +
                                       '--js tiletothetop/static/js/jquery-cookie-master/jquery.cookie.js ' +
                                       '--js tiletothetop/static/js/leaderboard.js ' +
                                       '--js tiletothetop/static/js/menu.js ' +
                                       '--js tiletothetop/static/js/messenger.js ' +
                                       '--js tiletothetop/static/js/modals.js ' +
                                       '--js tiletothetop/static/js/textfill.js ' +
                                       '--js tiletothetop/static/js/tilearea.js ' +
                                       '--js tiletothetop/static/js/timer.js ' +
                                       '--js tiletothetop/static/js/transitionscreen.js ' +
                                       '--js tiletothetop/static/js/utilities.js ' +
                                       '--js tiletothetop/static/js/wordlists.js ' +
                                       '--js tiletothetop/static/js/workspace.js ' +
                                       '--js tiletothetop/static/js/facebook.js ' +
                                       '--js_output_file tiletothetop/static/js/tiletothetop.min.js')

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


