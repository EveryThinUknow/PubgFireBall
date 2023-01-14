from django.contrib.auth import authenticate, login
from django.http import JsonResponse

def signin(request):
    data = request.GET
    username = data.get('username')
    password = data.get('password')
    ##检查数据库中是否有username和password对应的user
    user = authenticate(username = username, password = password)
    if not user:
        return JsonResponse({
            'result': "用户名或密码不正确"
        })
    ##如果存在
    login(request, user)
    return JsonResponse({
        'result': "success"
    })
