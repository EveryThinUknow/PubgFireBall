from django.http import JsonResponse
from urllib.parse import quote ##支持一般ascii码以外的其他字符在url中使用
from random import randint
from django.core.cache import cache

##随机获取一个长度为8的数字，作为请求的state，用来验证发送和返回信息是否是同一个state
def get_state():
    res = ""
    for i in range(8):
        res += str(randint(0,9))
    return res


def apply_code(request):
    appid = "4260" ##app授权给予的appid
    redirect_uri = quote("https://app4260.acapp.acwing.com.cn/settings/redistest/app/receive_code/") ##返回信息的接收地址
    scope = "userinfo"
    state = get_state()

    cache.set(state, True, 7200) #7200s，意思是确认授权登录的等待时间是2小时

    return JsonResponse({
        'result': "success",
        'appid': appid,
        'redirect_uri': redirect_uri,
        'scope': scope,
        'state': state,
    })
