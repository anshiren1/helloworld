from django.urls import path
from . import views

app_name = "core"

urlpatterns = [
    path("", views.DashboardView.as_view(), name="dashboard"),
    path("clients/", views.ClientListView.as_view(), name="client_list"),
    path("clients/new/", views.ClientCreateView.as_view(), name="client_create"),
    path("clients/<int:pk>/", views.ClientDetailView.as_view(), name="client_detail"),
    path("cases/", views.CaseListView.as_view(), name="case_list"),
    path("cases/new/", views.CaseCreateView.as_view(), name="case_create"),
    path("cases/<int:pk>/", views.CaseDetailView.as_view(), name="case_detail"),
    path("time/new/", views.TimeEntryCreateView.as_view(), name="time_create"),
    path("expenses/new/", views.ExpenseCreateView.as_view(), name="expense_create"),
]