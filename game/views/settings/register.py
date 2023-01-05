from django.contrib.auth import login
from django.http import JsonResponse
from django.contrib.auth.models import User
from game.models.player.player import Player

def register(request):
    data = request.GET
    username = data.get("username", "").strip()
    password = data.get("password", "").strip()
    password_confirm = data.get("password_confirm", "").strip()
    if not username or not password:
        return JsonResponse({
            'result': "用户名和密码不能为空"
        })

    if password != password_confirm:
        return JsonResponse({
            'result': "两个密码不一致"
        })

    ##如果该用户名已经存在，用exist()函数判断
    if User.objects.filter(username = username).exists():
        return JsonResponse({
            'result': "用户名已存在"
        })
    ##如果用户名和密码都已经输入，并且用户名未注册，则可以注册：
    user = User(username = username)
    ##用set_password设置用户的密码，保存的是密码字符串的哈希值
    user.set_password(password)
    user.save()
    ##为游戏创建一个新的player对象
    Player.objects.create(user=user, photo="https://p8.itc.cn/images01/20200925/a909298d8247495bb92d7aa060a23d54.jpeg")

    login(request, user)
    return JsonResponse({
        'result': "success"
    })

