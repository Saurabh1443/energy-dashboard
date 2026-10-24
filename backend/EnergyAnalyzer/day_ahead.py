from datetime import datetime, time, timedelta
from zoneinfo import ZoneInfo


LONDON_TZ = ZoneInfo("Europe/London")
DAY_AHEAD_GATE_HOUR = 11
DAY_AHEAD_GATE_MINUTE = 0


def get_day_ahead_gate(delivery_date):
    """
    UK day-ahead purchases for delivery day D are made on D-1.
    Gate is modelled as 11:00 Europe/London on the day before delivery.
    Only forecasts with publish_time <= this gate were knowable at buy time.
    """
    decision_day = delivery_date - timedelta(days=1)

    return datetime.combine(
        decision_day,
        time(DAY_AHEAD_GATE_HOUR, DAY_AHEAD_GATE_MINUTE),
        tzinfo=LONDON_TZ,
    )
