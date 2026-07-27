from django import forms
from django.contrib import admin, messages
from django.contrib.admin.helpers import ACTION_CHECKBOX_NAME
from django.shortcuts import render
from django.utils import timezone

from .models import Teacher


class RemovalReasonForm(forms.Form):
    """Remove karte waqt reason maangne ke liye chhota form."""
    reason = forms.CharField(
        label='Removal reason',
        widget=forms.Textarea(attrs={'rows': 3}),
        required=True,
        help_text='Why is this teacher being removed? (e.g. "Left the institute")',
    )


@admin.register(Teacher)
class TeacherAdmin(admin.ModelAdmin):
    """Teacher ko admin panel mein dikhane/manage karne ke liye."""

    list_display = ('name', 'designation', 'email', 'is_active', 'created_at')
    list_filter = ('is_active', 'designation')
    search_fields = ('name', 'email')
    actions = ['remove_teachers', 'reactivate_teachers']

    def get_fields(self, request, obj=None):
        # ADD form: sirf ye 3 fields (removal wale bilkul nahi)
        if obj is None:
            return ('name', 'email', 'designation')
        # EDIT form: removal info bhi dikhe (par read-only — neeche)
        return ('name', 'email', 'designation', 'is_active', 'removal_reason', 'removed_at')

    def get_readonly_fields(self, request, obj=None):
        # Removal wale fields form se edit nahi hote — ye action se set hote hain
        if obj is None:
            return ()
        return ('is_active', 'removal_reason', 'removed_at')

    @admin.action(description='Remove teacher(s) — soft delete (asks for a reason)')
    def remove_teachers(self, request, queryset):
        """
        List mein teacher(s) select karo -> ye action chuno -> Run ->
        reason wala page khulega -> reason daalo -> soft delete.
        (Record delete nahi hoga, bas is_active=False + reason save hoga.)
        """
        # Doosri baar (reason bhar ke submit) — asli soft delete
        if 'apply' in request.POST:
            form = RemovalReasonForm(request.POST)
            if form.is_valid():
                reason = form.cleaned_data['reason']
                count = queryset.update(
                    is_active=False,
                    removal_reason=reason,
                    removed_at=timezone.now(),
                )
                self.message_user(
                    request,
                    f'{count} teacher(s) removed (soft delete).',
                    messages.SUCCESS,
                )
                return None  # wapas list par

        # Pehli baar — reason wala page dikhao
        else:
            form = RemovalReasonForm()

        return render(request, 'admin/teachers/remove_reason.html', {
            'teachers': queryset,
            'form': form,
            'action_checkbox_name': ACTION_CHECKBOX_NAME,
            'title': 'Remove teacher(s) — reason',
        })

    @admin.action(description='Reactivate teacher(s) — make active again')
    def reactivate_teachers(self, request, queryset):
        """
        Hataya hua teacher wapas aa gaya — use dobara active karo.
        is_active = True + removal info (reason/removed_at) saaf.
        """
        count = queryset.update(
            is_active=True,
            removal_reason='',
            removed_at=None,
        )
        self.message_user(
            request,
            f'{count} teacher(s) reactivated.',
            messages.SUCCESS,
        )
