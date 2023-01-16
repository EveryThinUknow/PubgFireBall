from django.urls import path
from game.views.settings.redistest.app.apply_code import apply_code as app_apply_code
from game.views.settings.redistest.app.receive_code import receive_code as app_receive_code

urlpatterns = [
    path("app/apply_code/", app_apply_code, name="settings_redistest_app_apply_code"),
    path("app/receive_code/", app_receive_code, name="settings_redistest_app_receive_code"),
]
