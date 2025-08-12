from django.db import models


class Client(models.Model):
    full_name = models.CharField(max_length=255)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=50, blank=True)
    address = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["full_name"]

    def __str__(self) -> str:
        return self.full_name


class Case(models.Model):
    class CaseStatus(models.TextChoices):
        OPEN = "open", "Open"
        ON_HOLD = "on_hold", "On Hold"
        CLOSED = "closed", "Closed"

    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name="cases")
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    practice_area = models.CharField(max_length=120, blank=True)
    status = models.CharField(max_length=20, choices=CaseStatus.choices, default=CaseStatus.OPEN)
    hourly_rate = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    opened_date = models.DateField(auto_now_add=True)
    closed_date = models.DateField(null=True, blank=True)

    class Meta:
        ordering = ["-opened_date", "title"]

    def __str__(self) -> str:
        return f"{self.title} — {self.client.full_name}"

    @property
    def total_time_fees(self):
        from decimal import Decimal
        total = Decimal("0.00")
        for entry in self.time_entries.all():
            rate = entry.rate if entry.rate is not None else self.hourly_rate
            total += (entry.hours or 0) * (rate or 0)
        return total

    @property
    def total_expenses(self):
        from decimal import Decimal
        return sum((e.amount for e in self.expenses.all()), Decimal("0.00"))

    @property
    def total_due(self):
        return self.total_time_fees + self.total_expenses


class TimeEntry(models.Model):
    case = models.ForeignKey(Case, on_delete=models.CASCADE, related_name="time_entries")
    date = models.DateField()
    description = models.TextField()
    hours = models.DecimalField(max_digits=6, decimal_places=2)
    rate = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True, help_text="Leave blank to use case hourly rate")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-date", "-created_at"]

    def __str__(self) -> str:
        return f"{self.date} {self.hours}h — {self.case.title}"


class Expense(models.Model):
    case = models.ForeignKey(Case, on_delete=models.CASCADE, related_name="expenses")
    date = models.DateField()
    description = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-date", "-created_at"]

    def __str__(self) -> str:
        return f"{self.date} ${self.amount} — {self.case.title}"
