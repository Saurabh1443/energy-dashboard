from datetime import datetime

from django.utils import timezone

from .analytics import calculate_metrics
from .day_ahead import get_day_ahead_gate
from .repositories import (
    count_actuals_for_period,
    get_actuals_for_date,
    get_day_ahead_forecasts_for_date,
)


def _hour_key(start_time):

    return start_time.replace(minute=0, second=0, microsecond=0)


def get_energy_data_for_date(target_date):
    actuals = get_actuals_for_date(target_date)
    forecasts = get_day_ahead_forecasts_for_date(target_date)
    gate = get_day_ahead_gate(target_date)

    forecast_by_hour = {
        _hour_key(item["start_time"]): item
        for item in forecasts
    }

    chart_data = []
    errors = []
    actual_values_for_metrics = []
    missing_forecasts = 0
    publish_times = []

    for actual in actuals:
        start_time = actual["start_time"]
        actual_val = actual["generation"]
        forecast_item = forecast_by_hour.get(_hour_key(start_time))

        forecast_val = (
            forecast_item["generation"] if forecast_item else None
        )
        forecast_publish_time = (
            forecast_item["publish_time"] if forecast_item else None
        )

        chart_data.append({
            "startTime": start_time.isoformat(),
            "settlementPeriod": actual["settlement_period"],
            "actualGeneration": actual_val,
            "forecastGeneration": forecast_val,
            "forecastPublishTime": (
                forecast_publish_time.isoformat()
                if forecast_publish_time
                else None
            ),
        })

        if forecast_val is None:
            missing_forecasts += 1
            continue

        errors.append(forecast_val - actual_val)
        actual_values_for_metrics.append(actual_val)
        publish_times.append(forecast_publish_time)

    metrics = calculate_metrics(errors, actual_values_for_metrics)

    error_band = metrics["errorBandMw"]
    for point in chart_data:
        forecast_val = point["forecastGeneration"]
        if forecast_val is None:
            point["forecastUpperBound"] = None
            point["forecastLowerBound"] = None
            continue

        point["forecastUpperBound"] = round(forecast_val + error_band, 2)
        point["forecastLowerBound"] = round(
            max(forecast_val - error_band, 0),
            2,
        )

    metrics.update({
        "totalDataPoints": len(chart_data),
        "missingForecastPoints": missing_forecasts,
    })

    latest_publish_time = max(publish_times) if publish_times else None

    return {
        "date": target_date.strftime("%Y-%m-%d"),
        "decisionContext": {
            "deliveryDate": target_date.strftime("%Y-%m-%d"),
            "decisionGate": gate.isoformat(),
            "gateTimezone": "Europe/London",
            "forecastRunPublishTime": (
                latest_publish_time.isoformat()
                if latest_publish_time
                else None
            ),
            "description": (
                "Forecasts published on or before the day-ahead gate "
                "(D-1 11:00 Europe/London) for the selected delivery day."
            ),
        },
        "metrics": metrics,
        "chartData": chart_data,
    }


def get_monthly_summary_data():
    current_tz = timezone.get_current_timezone()

    start_time = timezone.make_aware(
        datetime(2026, 1, 1),
        current_tz,
    )
    end_time = timezone.make_aware(
        datetime(2026, 2, 1),
        current_tz,
    )

    total_actuals = count_actuals_for_period(
        start_time,
        end_time,
    )

    return {
        "month": "January 2026",
        "totalRecordsTracked": total_actuals,
        "status": "Optimized and Ready",
    }
