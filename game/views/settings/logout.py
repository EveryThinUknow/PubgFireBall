from django.contrib.auth import logout
from django.http import JsonResponse

def signout(request):
    user = request.user
    ##如果已经登录了
    if not user.is_authenticated:
        return JsonResponse({
            'result': "success"
        })
    logout(request)
    return JsonResponse({
        'result': "success"
        })
