from django.shortcuts import render
from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from .models import CustomUser
from .serializers import UserRegistrationSerializer, UserSerializer

# Create your views here.

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        print("Registration data received:", request.data)  # Debug print
        print("Request content type:", request.content_type)  # Debug print
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                'user': UserSerializer(user).data,
                'token': token.key
            }, status=status.HTTP_201_CREATED)
        print("Serializer errors:", serializer.errors)  # Debug print
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        print("Login attempt - data received:", request.data)  # Debug print
        
        # Check if required fields are present
        username = request.data.get('username')
        password = request.data.get('password')
        login_type = request.data.get('login_type')  # 'student' or 'placement_team'
        
        if not username or not password:
            return Response({
                'error': 'Both username and password are required',
                'field': None
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if user exists
        try:
            user_exists = CustomUser.objects.get(username=username)
        except CustomUser.DoesNotExist:
            return Response({
                'error': 'User does not exist. Please check your username or register.',
                'field': 'username'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if password is correct
        user = authenticate(username=username, password=password)
        if user is None:
            return Response({
                'error': 'Password is incorrect. Please try again.',
                'field': 'password'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if user role matches selected login type
        if login_type:
            if login_type == 'student' and user.role != 'student':
                return Response({
                    'error': 'This account is not a student account. Please select "Placement Team" to login.',
                    'field': 'role'
                }, status=status.HTTP_400_BAD_REQUEST)
            elif login_type == 'placement_team' and user.role not in ['placement_team', 'admin']:
                return Response({
                    'error': 'This account is not a placement team account. Please select "Student" to login.',
                    'field': 'role'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        # User authenticated successfully
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'user': UserSerializer(user).data,
            'token': token.key
        })

class UserProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
