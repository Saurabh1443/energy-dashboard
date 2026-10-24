from django.urls import path
from EnergyAnalyzer.views import get_energy_data, get_monthly_summary

urlpatterns = [
    path('energy-data/', get_energy_data, name='energy-data'),
    path('monthly-summary/', get_monthly_summary, name='monthly-summary'),
]