from rest_framework import serializers
from .models import Restaurant, Review

class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = "__all__"

class RestaurantSerializer(serializers.ModelSerializer):
    rating = serializers.SerializerMethodField()
    reviewCount = serializers.SerializerMethodField()
    reviews = ReviewSerializer(many=True, read_only=True)

    class Meta:
        model = Restaurant
        fields = [
            "id", "name", "address", "cuisine", "image", "description",
            "phone", "hours", "rating", "reviewCount", "reviews"
        ]

    def get_rating(self, obj):
        return obj.average_rating()

    def get_reviewCount(self, obj):
        return obj.review_count()
