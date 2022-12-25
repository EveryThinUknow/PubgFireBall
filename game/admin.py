from django.contrib import admin
from game.models.player.player import Player

# Register your models here.

##让定义的类注册到django的管理界面
admin.site.register(Player)
