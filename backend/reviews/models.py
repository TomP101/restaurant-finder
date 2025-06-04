from django.db import models

class Restaurant(models.Model):
    name = models.CharField(max_length=255)
    address = models.CharField(max_length=255)
    cuisine = models.CharField(max_length=100)
    image = models.URLField(blank=True)
    description = models.TextField(blank=True)
    phone = models.CharField(max_length=50, blank=True)
    hours = models.CharField(max_length=100, blank=True)

    def average_rating(self):
        reviews = self.reviews.all()
        if reviews.exists():
            return round(sum([r.rating for r in reviews]) / reviews.count(), 2)
        return 0

    def review_count(self):
        return self.reviews.count()

    def __str__(self):
        return self.name

class Review(models.Model):
    place_id = models.CharField(max_length=255, null=True, blank=True)
    restaurant_name = models.CharField(max_length=255, null=True, blank=True)
    author = models.CharField(max_length=100)
    rating = models.IntegerField()
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Review for {self.place_id} by {self.author}"
