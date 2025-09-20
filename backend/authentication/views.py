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
        print("Request content type:", request.content_type)  # Debug print
        
        # Check if required fields are present
        username = request.data.get('username')
        password = request.data.get('password')
        
        if not username or not password:
            return Response({
                'error': 'Both username and password are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            serializer = self.serializer_class(data=request.data,
                                               context={'request': request})
            if serializer.is_valid():
                user = serializer.validated_data['user']
                token, created = Token.objects.get_or_create(user=user)
                return Response({
                    'user': UserSerializer(user).data,
                    'token': token.key
                })
            else:
                print("Serializer errors:", serializer.errors)  # Debug print
                return Response({
                    'error': 'Invalid credentials',
                    'details': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print("Login error:", str(e))  # Debug print
            return Response({
                'error': 'Login failed',
                'details': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

class UserProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
