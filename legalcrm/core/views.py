from django.db.models import Count
from django.urls import reverse_lazy
from django.views.generic import TemplateView, ListView, DetailView, CreateView

from .models import Client, Case, TimeEntry, Expense


class DashboardView(TemplateView):
    template_name = "core/dashboard.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["client_count"] = Client.objects.count()
        context["case_count"] = Case.objects.count()
        context["open_cases"] = Case.objects.filter(status="open").select_related("client")[:5]
        context["recent_time_entries"] = TimeEntry.objects.select_related("case", "case__client")[:5]
        context["recent_expenses"] = Expense.objects.select_related("case", "case__client")[:5]
        return context


class ClientListView(ListView):
    model = Client
    template_name = "core/client_list.html"


class ClientDetailView(DetailView):
    model = Client
    template_name = "core/client_detail.html"


class ClientCreateView(CreateView):
    model = Client
    fields = ["full_name", "email", "phone", "address", "notes"]
    template_name = "core/client_form.html"
    success_url = reverse_lazy("core:client_list")


class CaseListView(ListView):
    model = Case
    template_name = "core/case_list.html"
    queryset = Case.objects.select_related("client")


class CaseDetailView(DetailView):
    model = Case
    template_name = "core/case_detail.html"


class CaseCreateView(CreateView):
    model = Case
    fields = ["client", "title", "description", "practice_area", "status", "hourly_rate"]
    template_name = "core/case_form.html"
    success_url = reverse_lazy("core:case_list")


class TimeEntryCreateView(CreateView):
    model = TimeEntry
    fields = ["case", "date", "description", "hours", "rate"]
    template_name = "core/timeentry_form.html"

    def get_success_url(self):
        return reverse_lazy("core:case_detail", kwargs={"pk": self.object.case_id})


class ExpenseCreateView(CreateView):
    model = Expense
    fields = ["case", "date", "description", "amount"]
    template_name = "core/expense_form.html"

    def get_success_url(self):
        return reverse_lazy("core:case_detail", kwargs={"pk": self.object.case_id})
