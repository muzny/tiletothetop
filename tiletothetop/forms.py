from django import forms
from django.contrib.auth.models import User

class RegistrationForm(forms.Form):
    username = forms.CharField(max_length=30, label="Username", required=True)
    email = forms.EmailField(max_length=30, label="Email", required=True)
    password1 = forms.CharField(widget=forms.PasswordInput(render_value=False), label="Password", required=True)
    password2 = forms.CharField(widget=forms.PasswordInput(render_value=False), label="Confirm Password", required=True)

    def clean_username(self):
        username = self.cleaned_data.get('username', None)
        try:
            User.objects.get(username=username)
        except User.DoesNotExist:
            return username

        raise forms.ValidationError("That username is already taken.")

    def clean_password1(self):
        password1 = self.cleaned_data.get('password1', None)
        if not password1:
            raise forms.ValidationError("Enter a password.")
        return password1

    def clean_password2(self):
        password2 = self.cleaned_data.get('password2', None)
        if not password2:
            raise forms.ValidationError("Re-enter your password.")
        return password2

    def clean(self):
        password1 = self.cleaned_data.get('password1')
        password2 = self.cleaned_data.get('password2')

        if not (password1 and password2):
            raise forms.ValidationError("Passwords must match.")
        if password1 != password2:
            raise forms.ValidationError("Passwords must match.")

        # TODO - make sure the password conforms to our security requirements
        return self.cleaned_data


class LoginForm(forms.Form):
    username = forms.CharField(max_length=30, label="Username", required=True)
    password = forms.CharField(widget=forms.PasswordInput(render_value=False), label="Password", required=True)

    def clean_username(self):
        username = self.cleaned_data.get('username', None)
        if not username:
            raise forms.ValidationError("Invalid Username.")
        try:
            User.objects.get(username=username)
        except User.DoesNotExist:
            raise forms.ValidationError("Invalid Username.")

        return username


    def clean_password(self):
        password = self.cleaned_data.get('password', None)
        if not password:
            raise forms.ValidationError("Please enter a password.")

        return password


