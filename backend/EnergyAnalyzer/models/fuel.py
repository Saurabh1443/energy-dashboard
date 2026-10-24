from django.db import models


class FuelHHActual(models.Model):
    dataset = models.CharField(max_length=20, default="FUELHH")
    publish_time = models.DateTimeField()
    start_time = models.DateTimeField(db_index=True)
    settlement_date = models.DateField()
    settlement_period = models.IntegerField()
    fuel_type = models.CharField(max_length=20, db_index=True)
    generation = models.FloatField()

    class Meta:
        unique_together = ('start_time', 'fuel_type')
        ordering = ['start_time']

    def __str__(self):
        return f"{self.fuel_type} - {self.start_time} ({self.generation} MW)"

