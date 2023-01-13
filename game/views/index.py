from django.shortcuts import render

## 返回web.html
def index(request):
    return render(request, "multiends/web.html")

