from django.db.models import OuterRef, Subquery

from .day_ahead import get_day_ahead_gate
from .models import FuelHHActual, WindForecast


def get_actuals_for_date(target_date):
    return list(
        FuelHHActual.objects
        .filter(
            start_time__date=target_date,
            fuel_type="WIND",
        )
        .order_by("start_time")
        .values(
            "start_time",
            "settlement_period",
            "generation",
        )
    )


def get_day_ahead_forecasts_for_date(target_date):
    gate = get_day_ahead_gate(target_date)

    day_ahead_forecast_pk = (
        WindForecast.objects
        .filter(
            start_time=OuterRef("start_time"),
            publish_time__lte=gate,
        )
        .order_by("-publish_time", "-pk")
        .values("pk")[:1]
    )

    return list(
        WindForecast.objects
        .filter(
            start_time__date=target_date,
            pk=Subquery(day_ahead_forecast_pk),
        )
        .order_by("start_time")
        .values(
            "start_time",
            "generation",
            "publish_time",
        )
    )


def count_actuals_for_period(start_time, end_time):
    return FuelHHActual.objects.filter(
        fuel_type="WIND",
        start_time__gte=start_time,
        start_time__lt=end_time,
    ).count()
