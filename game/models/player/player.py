from django.db import models
from django.contrib.auth.models import User

class Player(models.Model):
    ##如果删除该user，也删除它对应的player
    user = models.OneToOneField(User, on_delete = models.CASCADE)
    ##用户头像
    photo = models.URLField(max_length = 256, blank = True)


    def __str__(self):
        return str(self.user)
