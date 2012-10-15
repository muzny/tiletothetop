# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):

        # Changing field 'Word.definition'
        db.alter_column('game_word', 'definition', self.gf('django.db.models.fields.CharField')(max_length=200))

    def backwards(self, orm):

        # Changing field 'Word.definition'
        db.alter_column('game_word', 'definition', self.gf('django.db.models.fields.CharField')(max_length=50))

    models = {
        'game.word': {
            'Meta': {'object_name': 'Word'},
            'definition': ('django.db.models.fields.CharField', [], {'max_length': '200'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'part_of_speech': ('django.db.models.fields.CharField', [], {'max_length': '10'}),
            'word': ('django.db.models.fields.CharField', [], {'max_length': '50'})
        }
    }

    complete_apps = ['game']