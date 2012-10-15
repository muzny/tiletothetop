# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'Word'
        db.create_table('tiletothetop_word', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('word', self.gf('django.db.models.fields.CharField')(max_length=50)),
            ('definition', self.gf('django.db.models.fields.CharField')(max_length=200)),
            ('part_of_speech', self.gf('django.db.models.fields.CharField')(max_length=10)),
        ))
        db.send_create_signal('tiletothetop', ['Word'])


    def backwards(self, orm):
        # Deleting model 'Word'
        db.delete_table('tiletothetop_word')


    models = {
        'tiletothetop.word': {
            'Meta': {'object_name': 'Word'},
            'definition': ('django.db.models.fields.CharField', [], {'max_length': '200'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'part_of_speech': ('django.db.models.fields.CharField', [], {'max_length': '10'}),
            'word': ('django.db.models.fields.CharField', [], {'max_length': '50'})
        }
    }

    complete_apps = ['tiletothetop']