import requests
from django.core.management.base import BaseCommand
from EnergyAnalyzer.models import FuelHHActual, WindForecast


class Command(BaseCommand):
    help = 'Fetches and seeds January 2026 Elexon FUELHH and WINDFOR data'

    FUELHH_URL = "https://data.elexon.co.uk/bmrs/api/v1/datasets/FUELHH/stream"
    WINDFOR_URL = "https://data.elexon.co.uk/bmrs/api/v1/datasets/WINDFOR/stream"

    # Settlement / publish window covering all January delivery periods.
    ACTUALS_FROM = "2026-01-01T00:00:00Z"
    ACTUALS_TO = "2026-02-01T00:00:00Z"

    # Include late-Dec publishes so early-January day-ahead gates have forecasts.
    FORECAST_PUBLISH_FROM = "2025-12-25T00:00:00Z"
    FORECAST_PUBLISH_TO = "2026-02-01T00:00:00Z"

    def handle(self, *args, **options):
        self.stdout.write("Starting Elexon January 2026 data ingestion...")

        self.seed_fuelhh(self.ACTUALS_FROM, self.ACTUALS_TO)
        self.seed_windfor(
            self.FORECAST_PUBLISH_FROM,
            self.FORECAST_PUBLISH_TO,
        )

        self.stdout.write(
            self.style.SUCCESS("Successfully seeded all January 2026 data!")
        )

    def seed_fuelhh(self, date_from, date_to):
        params = {
            "publishDateTimeFrom": date_from,
            "publishDateTimeTo": date_to,
            "fuelType": "WIND",
        }

        self.stdout.write("Fetching FUELHH actuals from Elexon...")
        response = requests.get(self.FUELHH_URL, params=params)

        if response.status_code == 200:
            data = response.json()
            records_to_create = [
                FuelHHActual(
                    dataset=item.get("dataset", "FUELHH"),
                    publish_time=item.get("publishTime"),
                    start_time=item.get("startTime"),
                    settlement_date=item.get("settlementDate"),
                    settlement_period=item.get("settlementPeriod"),
                    fuel_type=item.get("fuelType"),
                    generation=item.get("generation", 0.0),
                )
                for item in data
            ]
            FuelHHActual.objects.bulk_create(
                records_to_create,
                ignore_conflicts=True,
            )
            self.stdout.write(
                f"Inserted {len(records_to_create)} actual generation records."
            )
        else:
            self.stdout.write(
                self.style.ERROR(
                    f"Failed to fetch FUELHH: {response.status_code}"
                )
            )

    def seed_windfor(self, date_from, date_to):
        params = {
            "publishDateTimeFrom": date_from,
            "publishDateTimeTo": date_to,
        }

        self.stdout.write("Fetching WINDFOR forecasts from Elexon...")
        response = requests.get(self.WINDFOR_URL, params=params)

        if response.status_code == 200:
            data = response.json()
            records_to_create = [
                WindForecast(
                    dataset=item.get("dataset", "WINDFOR"),
                    publish_time=item.get("publishTime"),
                    start_time=item.get("startTime"),
                    generation=item.get("generation", 0.0),
                )
                for item in data
                if self._is_january_2026_start(item.get("startTime"))
            ]
            WindForecast.objects.bulk_create(
                records_to_create,
                ignore_conflicts=True,
            )
            self.stdout.write(
                f"Inserted {len(records_to_create)} forecast records."
            )
        else:
            self.stdout.write(
                self.style.ERROR(
                    f"Failed to fetch WINDFOR: {response.status_code}"
                )
            )

    def _is_january_2026_start(self, start_time):
        if not start_time:
            return False
        return str(start_time).startswith("2026-01")
