#Setting up a Dev Environment
I highly recommend using linux for development, preferably Ubuntu 12.04, since
all of the commands I'll list were tested on it. Even if you don't have Ubuntu, 
installing it in virtualbox would take far less time than figuring out how
to get all of this to work on your current machine. I'm assuming
you have Python 2.7.x already installed -- Django is not compatible with
Python 3.x

The only things you'll need to install outside of your virtual environment
are postgresql and virtualenv. Everything else will be installed via the 
requirements.txt file, and should be platform-independent.

## Postgres
We'll be using Postgres instead of MySQL since Heroku is configured to
use it with no additional setup. You'll need to install Postgres and
create a database on your machine for testing locally:

     sudo apt-get install postgresql

Then configure a new user and add a database, matching the options in 
our Django `settings.py`:

     >$ sudo passwd postgres
     Enter new UNIX password:  # make this whatever you like
     Retype new UNIX password: 
     passwd: password updated successfully

     >$ sudo -u postgres createuser -P django_login
     Enter password for new role: password    # yes, 'password'
     Enter it again: password
     Shall the new role be a superuser? (y/n) n
     Shall the new role be allowed to create databases? (y/n) y
     Shall the new role be allowed to create more new roles? (y/n) n

     >$ su postgres  # switch to the postgres user
     >$ psql template1  # enter postgres shell

From the postgres shell:

     CREATE DATABASE django_db OWNER django_login ENCODING 'UTF8';

Enter `\q` to exit the postgres shell, and then `exit` to go back to
your normal user account.

Then edit the Postgres permissions file (as root) in
`/etc/postgresql/9.1/main/pg_hba.conf` and add the following:

     local      django_db   django_login   md5
     # if that doesn't work (errors running syncdb later), try
     local      all         all            md5

Finally, restart postgres:

     sudo /etc/init.d/postgresql restart

###Additional Postgres trouble

Note: when setting up the python psycopg module (it's referenced in the
requirements.txt -- see the next section), I encountered an error.
It was resolved by running

     sudo apt-get install libpq-dev python-dev # for Ubuntu

See [this](http://stackoverflow.com/questions/5420789/how-to-install-psycopg2-with-pip-on-python)
for Windows / Mac psycopg2 installation instructions.

If you ever get a `Postgres failed to start` error complaining about `SHMMAX`,
check out [this stackoverflow thread](http://askubuntu.com/questions/44373/how-to-fix-postgresql-installation).

## virtualenv and Python Dependencies
Virtual environments allow you to install python packages locally for 
each project. You can then work with different versions of python,
django, etc. and not worry about conflicts. This is also the
recommended way to setup a project that will be deployed to Heroku. So, 
install virtualenv:

     sudo apt-get install python-virtualenv

Get the repo:

     git clone https://github.com/muzny/tiletothetop.git && cd tiletothetop

Create a virtual environment and install the project dependencies:

     virtualenv venv --distribute  # create a new virtual environment
     source venv/bin/activate  # activates the current environment

     pip install -r requirements.txt 

To deactivate the current virtual environment, use the `deactivate`
command. Make sure the current environment is active whenever you're
working on the project.

## Development

### South
South is one of the python packages automatically installed for you via
the requirements.txt. Using South allows us to easily change our database
schema, migrate our data to a db using the new schema, and rollback
changes to the schema if necessary.

The first time you set up a fresh project, after the python packages have
been installed from requirements.txt, you should run syncdb:

     python manage.py syncdb

Whenever you get changes from the repo, you'll need to migrate your 
database if anyone made changes to the database schema (by changing
a models.py, for instance). Run this just to be safe:

     python manage.py migrate

You could also specify the app name, but we're currently using only a
single app.

If you're the one changing the schema, you'll need to add a new entry
to the migration history:

     python manage.py schemamigration tiletothetop --auto

You'll see the `syncdb` command in the django tutorials, but you won't need
to use it anymore unless you add to the INSTALLED_APPS in `settings.py`.
Instead, you'll do a `schemamigration` followed by a `migrate`.

### Testing Locally

    python manage.py runserver

Use your browser to navigate to localhost:8000

The live version of the site uses `gunicorn` instead of the built-in development
webserver. This is specified in the `Procfile`. If you want to use gunicorn
locally, you can run `foreman start`.

#Deployment
If you need a Heroku collaborator invite, send me an email.
To deploy, you'll need to install the
[Heroku Toolbelt](https://toolbelt.heroku.com/). There's a Ruby gem
you can use if you're not on Debian/Ubuntu. Otherwise:

     wget -qO- https://toolbelt.heroku.com/install.sh | sh  

The first time you deploy, you'll need to add the heroku remote so you
can push to it:

     heroku login
     heroku git:remote -a tiletothetop

Then it's a simple as navigating to the top-level `tiletothetop` directory
and running the following command:

     git push heroku master

Check it out at [http://tiletothetop.herokuapp.com](http://tiletothetop.herokuapp.com)

It may take a few seconds to load initially. This is because we're on a free plan
and Heroku idles our dyno after an hour of inactivity. It should only cause
a few seconds delay for the first request as the dyno starts up.

#TODO
* Currently gunicorn isn't being used as the production webserver because it doesn't find
our static files automatically. 
