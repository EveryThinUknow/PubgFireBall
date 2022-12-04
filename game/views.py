from django.http import HttpResponse


def index(request):
    line1 = '<h1 style = "text-align: center">术士大战</h1>'
    line4 = '<a href = "play/">进入游戏</a>'
    line3 = '<hr>'
    line2 = '<img src = "https://img2.baidu.com/it/u=2114118135,2810605549&fm=253&fmt=auto&app=138&f=JPEG?w=640&h=360" width = 800>'
    return HttpResponse(line1 + line4 + line3 + line2)

def play(request):
    line1 = '<h1 style = "text-align: center">游戏界面</h1>'
    line2 = '<a href = "/game/">返回首页</a>'
    return HttpResponse(line1 + line2)

