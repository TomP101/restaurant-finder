import os
import requests
from django.contrib.auth import authenticate, login
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated, AllowAny

from .models import Restaurant, Review
from .serializers import RestaurantSerializer, ReviewSerializer
from django.contrib.auth.models import User
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status

class RestaurantList(generics.ListAPIView):
    queryset = Restaurant.objects.all()
    serializer_class = RestaurantSerializer

class RestaurantDetail(generics.RetrieveAPIView):
    queryset = Restaurant.objects.all()
    serializer_class = RestaurantSerializer

class ReviewListCreate(generics.ListCreateAPIView):
    serializer_class = ReviewSerializer

    def get_queryset(self):
        restaurant_id = self.kwargs["restaurant_id"]
        return Review.objects.filter(restaurant_id=restaurant_id)

    def perform_create(self, serializer):
        restaurant_id = self.kwargs["restaurant_id"]
        serializer.save(restaurant_id=restaurant_id)

class ReviewCreate(generics.CreateAPIView):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer


def search_restaurants(request):
    query = request.GET.get("query", "")
    api_key = os.environ.get("API_KEY")

    if not api_key:
        return JsonResponse({"error": "API key not configured"}, status=500)

    # Endpoint i nagłówki do Places API (New)
    url = "https://places.googleapis.com/v1/places:searchText"
    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": api_key,
        "X-Goog-FieldMask": (
            "places.displayName,places.formattedAddress,places.location,"
            "places.rating,places.userRatingCount,places.priceLevel,places.photos"
        )
    }

    payload = {
        "textQuery": query,
        "languageCode": "pl",
        "regionCode": "PL",
        "maxResultCount": 10
    }

    response = requests.post(url, headers=headers, json=payload)
    data = response.json()

    for place in data.get("places", []):
        if "id" in place:
            place["place_id"] = place["id"]
        elif "photos" in place and place["photos"]:
            photo_name = place["photos"][0].get("name", "")
            parts = photo_name.split("/")
            if len(parts) >= 2:
                place["place_id"] = parts[1]
            else:
                place["place_id"] = None
        else:
            place["place_id"] = None
        photos = place.get("photos", [])
        if photos:
            photo_name = photos[0].get("name")
            place["imageUrl"] = f"https://places.googleapis.com/v1/{photo_name}/media?key={api_key}&maxHeightPx=400&maxWidthPx=400"
        else:
            place["imageUrl"] = None

    return JsonResponse(data)

def place_details(request):
    place_id = request.GET.get("place_id", "")
    api_key = os.environ.get("API_KEY")
    if not api_key or not place_id:
        return JsonResponse({"error": "Missing API key or place_id"}, status=400)

    url = "https://places.googleapis.com/v1/places/{}".format(place_id)
    headers = {
        "X-Goog-Api-Key": api_key,
        "X-Goog-FieldMask": (
            "displayName,formattedAddress,location,rating,userRatingCount,"
            "priceLevel,photos,internationalPhoneNumber,regularOpeningHours,reviews,"
            "websiteUri,editorialSummary"
        )
    }
    response = requests.get(url, headers=headers)
    return JsonResponse(response.json())

@api_view(['POST'])
def register_user(request):
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response({'error': 'Brakuje nazwy użytkownika lub hasła.'}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(username=username).exists():
        return Response({'error': 'Użytkownik już istnieje.'}, status=status.HTTP_400_BAD_REQUEST)

    User.objects.create_user(username=username, password=password)
    return Response({'message': 'Użytkownik zarejestrowany pomyślnie.'}, status=status.HTTP_201_CREATED)

@api_view(['POST'])
def login_user(request):
    username = request.data.get('username')
    password = request.data.get('password')

    user = authenticate(request, username=username, password=password)
    if user is not None:
        login(request, user)
        return Response({'message': 'Zalogowano pomyślnie.'}, status=status.HTTP_200_OK)
    else:
        return Response({'error': 'Nieprawidłowe dane logowania.'}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['GET'])
def whoami(request):
    if request.user.is_authenticated:
        return Response({'username': request.user.username})
    return Response({'username': None})

@api_view(['GET'])
def logout_user(request):
    from django.contrib.auth import logout
    logout(request)
    return Response({'message': 'Wylogowano pomyślnie.'}, status=200)

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def add_review(request):
    place_id = request.data.get("place_id")
    restaurant_name = request.data.get("restaurant_name")
    rating = request.data.get("rating")
    text = request.data.get("text")

    if not place_id or not rating or not text:
        return Response({"error": "Brak wymaganych danych."}, status=400)

    Review.objects.create(
        place_id=place_id,
        restaurant_name=restaurant_name,
        author=request.user.username,
        rating=rating,
        text=text,
    )

    return Response({"message": "Recenzja została zapisana."})

@api_view(['GET'])
def get_user_reviews(request):
    user_reviews = Review.objects.filter(author=request.user.username).order_by('-created_at')
    serializer = ReviewSerializer(user_reviews, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def get_reviews_for_place(request):
    place_id = request.GET.get("place_id")
    if not place_id:
        return Response({"error": "Brak place_id"}, status=400)

    reviews = Review.objects.filter(place_id=place_id).order_by("-created_at")
    serialized = ReviewSerializer(reviews, many=True)
    return Response(serialized.data)


