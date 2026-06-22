import speech_recognition as sr
import webbrowser
import pyttsx3
import music_llibrary
import os
import requests
from client import chat_with_gpt
import time
from dotenv import load_dotenv
import pywhatkit


load_dotenv()


API_KEY = os.getenv("NEWS_API_KEY")
NEWS_URL = f"https://newsapi.org/v2/top-headlines?country=in&category=general&apiKey={API_KEY}"

recognizer = sr.Recognizer()
last_news_time = 0  # initialize outside the loop
news_cache = ""

def get_news():
    try:
        response = requests.get(NEWS_URL)
        data = response.json()
        print("Debug API response:", data)
        articles = data.get("articles", [])
        if not articles:
            return "No news found."
        top_headlines = [article["title"] for article in articles[:5]]
        return "Here are the top headlines: " + ". ".join(top_headlines)
    except Exception as e:
        return f"Error fetching news: {e}"
    
def play_song(song_name):
    try:
        speak(f"Playing {song_name} on YouTube.")
        pywhatkit.playonyt(song_name)  # auto-plays top YouTube result
    except Exception as e:
        speak(f"Sorry, I couldn’t play {song_name}. Error: {e}")

def speak(text):
    engine = pyttsx3.init()
    engine.say(text)
    engine.runAndWait()
    engine.stop()

def process_command(command, last_news_time, news_cache):
    print("Command received:", command)
    
    command_lower = command.lower()
    
    if "gpt" in command_lower:
        webbrowser.open("https://chatgpt.com")
    elif "google" in command_lower:
        webbrowser.open("https://google.com")
    elif 'youtube' in command_lower:
        webbrowser.open('https://youtube.com')
    elif "quora" in command_lower:
        webbrowser.open("https://quora.com")
    elif "leetcode" in command_lower or "dsa" in command_lower:
        webbrowser.open("https://leetcode.com")
    elif "portfolio" in command_lower or "codolio" in command_lower:
        webbrowser.open("https://codolio.com/profile/iamKSR")
    elif "github" in command_lower:
        webbrowser.open("https://github.com")
    elif "anime" in command_lower:
        webbrowser.open("https://anikai.to/")
    
    elif command_lower.startswith('play'):
        song_name = command_lower.replace("play", "").strip()
        if song_name:
            play_song(song_name)
        else:
            speak("Please tell me which song you want to play.")

    elif "news" in command_lower:
        current_time = time.time()
        if current_time - last_news_time > 1800:
            speak("Fetching the latest news.")
            news_cache = get_news()
            last_news_time = current_time
        else:
            speak("Using cached news from earlier.")
        speak(news_cache)
    elif "ai" in command_lower:
        speak("What do you want to ask me, master? I am listening...")
        with sr.Microphone() as source:
            recognizer.adjust_for_ambient_noise(source, duration=1.5)
            audio = recognizer.listen(source, timeout=10, phrase_time_limit=10)
            try:
                question = recognizer.recognize_google(audio)
                print (question)
                answer = chat_with_gpt(question)
                speak(answer)
            except sr.UnknownValueError:
                speak("Sorry, I could not understand what you said.")
            except sr.RequestError as e:
                speak(f"Could not request results from Google Speech Recognition service; {e}")

    
    return last_news_time, news_cache

if __name__ == "__main__":
    speak("Initialising Jarvis..")
    speak("Testing voice output")
    
    while True:
        try:
            with sr.Microphone() as source:
                recognizer.adjust_for_ambient_noise(source, duration=0.8)
                print("Listening...")
                audio = recognizer.listen(source, timeout=8, phrase_time_limit=5)
                print("Recognizing...")
            word = recognizer.recognize_google(audio)
            
            if "jarvis" in word.lower():
                speak("Hello master")
                
                with sr.Microphone() as source:
                    recognizer.adjust_for_ambient_noise(source, duration=0.8)
                    print("Jarvis Active...")
                    audio = recognizer.listen(source)
                    command = recognizer.recognize_google(audio)
                    
                    # Update last_news_time and news_cache properly
                    last_news_time, news_cache = process_command(command, last_news_time, news_cache)
        except Exception as e:
            print("Error; {0}".format(e))
