from django.db import models
from django.contrib.auth.models import User

class Player(models.Model):
    ##如果删除该user，也删除它对应的player
    user = models.OneToOneField(User, on_delete = models.CASCADE)
    ##用户头像
    photo = models.URLField(max_length = 256, blank = True)

    ##用于在APP共享平台登录，测试以redis数据库为基础的一键登录功能
    ##通过浏览器登录不需要该功能，可省略
    openid = models.CharField(default="", max_length = 50, blank = True, null = True)


    def __str__(self):
        return str(self.user)
