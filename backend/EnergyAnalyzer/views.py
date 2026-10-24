from django.http import JsonResponse

from .validator import validate_january_date
from .services import (
    get_monthly_summary_data,
    get_energy_data_for_date,
)



def get_energy_data(request):
    date_str = request.GET.get("date", "2026-01-01")

    target_date, error_msg = validate_january_date(date_str)
    if error_msg:
        return JsonResponse({'error': error_msg}, status=400)

    data = get_energy_data_for_date(target_date)

    return JsonResponse(data)
    


def get_monthly_summary(request):
    response_payload = get_monthly_summary_data()
    return JsonResponse(response_payload)