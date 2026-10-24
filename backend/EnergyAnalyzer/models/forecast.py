from django.db import models


class WindForecast(models.Model):
    dataset = models.CharField(max_length=20, default="WINDFOR")
    publish_time = models.DateTimeField(db_index=True) 
    start_time = models.DateTimeField(db_index=True)   
    generation = models.FloatField() 

    class Meta:
        unique_together = ('start_time', 'publish_time')
        ordering = ['start_time', '-publish_time']

    def __str__(self):
        return f"Forecast [Pub: {self.publish_time}] for {self.start_time} - {self.generation} MW"