from django.contrib import admin
from .models import Client, Case, TimeEntry, Expense


@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ("full_name", "email", "phone", "created_at")
    search_fields = ("full_name", "email", "phone")


@admin.register(Case)
class CaseAdmin(admin.ModelAdmin):
    list_display = ("title", "client", "status", "practice_area", "hourly_rate", "opened_date", "closed_date")
    list_filter = ("status", "practice_area")
    search_fields = ("title", "client__full_name")


@admin.register(TimeEntry)
class TimeEntryAdmin(admin.ModelAdmin):
    list_display = ("case", "date", "hours", "rate")
    list_filter = ("case",)
    search_fields = ("case__title", "description")


@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ("case", "date", "description", "amount")
    list_filter = ("case",)
    search_fields = ("case__title", "description")
