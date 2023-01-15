from django.http import JsonResponse
from game.models.player.player import Player

def getinfo_acapp(request):
    player = Player.objects.all()[0]
    return JsonResponse({
        'result': "success",
        'username': player.user.username,
        'photo': player.photo,
        })

def getinfo_web(request):
    user = request.user
    ##内置函数，判断获取的这个用户是否已经登录
    if not user.is_authenticated:
        return JsonResponse({
            'result': "not login",
        })
    else:
        player = Player.objects.get(user=user)
        return JsonResponse({
            'result': "success",
            'username': player.user.username,
            'photo': player.photo,
        })

#每一个处理client端请求的后端函数，都要有一个参数叫做request来判断从哪里登录
def getinfo(request):
    platform = request.GET.get('platform')
    if platform == "ACAPP":
        return getinfo_acapp(request)

    elif platform == "WEB":
        return getinfo_web(request)
