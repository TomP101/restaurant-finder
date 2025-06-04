from django.http import HttpResponse
from django.urls import path

from . import views
from .views import RestaurantList, RestaurantDetail, ReviewListCreate, ReviewCreate, search_restaurants, register_user

urlpatterns = [
    path("restaurants/", RestaurantList.as_view(), name="restaurant-list"),
    path("restaurants/<int:pk>/", RestaurantDetail.as_view(), name="restaurant-detail"),
    path("restaurants/<int:restaurant_id>/reviews/", ReviewListCreate.as_view(), name="restaurant-reviews"),
    path("reviews/", ReviewCreate.as_view(), name="review-create"),
    path("search/", search_restaurants),
    path("places/details/", views.place_details),
    path('register/', views.register_user, name='register'),
    path('login/', views.login_user, name='login'),
    path("whoami/", views.whoami, name="whoami"),
    path('logout/', views.logout_user, name='logout'),
    path("reviews/place/", views.get_reviews_for_place),
    path("reviews/add/", views.add_review),
    path("user/reviews/", views.get_user_reviews, name="user-reviews"),


]
