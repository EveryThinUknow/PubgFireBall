from django.http import JsonResponse

def apply_code(request):
    appid = "165"
    return JsonResponse({
        'result': "success"
    })
