# Triply AI

## Overview

Trip Buddy AI is a full-stack AI travel planning application that generates personalized travel 
itineraries based on user preferences such as destination, budget, trip duration, and group size. 
The application uses Google's Gemini AI along with Google Maps services to create structured and practical travel plans 
within seconds.

## Features

* Generate AI-powered personalized travel itineraries
* Multi-step travel planning interface with progress tracking
* Google Places Autocomplete for destination search
* Dynamic destination images using Google Places Photos API
* Google Maps integration for hotels and attractions
* Secure Google OAuth authentication
* Save and manage trips using Cloud Firestore
* View previously generated itineraries from the My Trips dashboard

## Architecture

### Frontend

* Multi-step form for collecting travel preferences
* Responsive user interface with real-time progress updates

### AI Integration

* Uses Gemini 2.5 Flash for itinerary generation
* Generates structured JSON responses
* Provides daily schedules, activities, hotels, transportation, and estimated costs

### Google Services

* Google Places API for location autocomplete
* Google Places Photos API for destination images
* Google Maps links for recommended locations

### Backend

* Firebase Authentication with Google OAuth
* Cloud Firestore for storing user-specific trip data
* Serverless architecture for scalability

## Tech Stack

* React.js
* Tailwind CSS
* Firebase Authentication
* Cloud Firestore
* Gemini AI SDK
* Google Places API
* Google Places Photos API
* Google Maps API

## Future Improvements

* Flight recommendations
* Weather integration
* PDF itinerary export
* Multi-language support
* Expense tracking
