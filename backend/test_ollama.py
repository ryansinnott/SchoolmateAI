#!/usr/bin/env python3
"""
Quick test script to verify Ollama and llama3.2:3b are working
Run this to debug connection issues: python test_ollama.py
"""

import requests
import json
import sys

OLLAMA_URL = "http://localhost:11434"
MODEL_NAME = "llama3.2:3b"

def test_ollama():
    print("=" * 60)
    print("OLLAMA CONNECTION TEST")
    print("=" * 60)
    
    # Test 1: Check if Ollama is running
    print("\n1. Testing Ollama connection...")
    try:
        response = requests.get(OLLAMA_URL, timeout=3)
        if response.status_code == 200 and "Ollama is running" in response.text:
            print("   ✅ Ollama is running at", OLLAMA_URL)
        else:
            print("   ❌ Ollama returned unexpected response")
            return False
    except requests.exceptions.ConnectionError:
        print("   ❌ Cannot connect to Ollama")
        print("   Solution: Run 'ollama serve' in a terminal")
        return False
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False
    
    # Test 2: Check available models
    print("\n2. Checking available models...")
    try:
        response = requests.get(f"{OLLAMA_URL}/api/tags", timeout=5)
        if response.status_code == 200:
            models = response.json().get('models', [])
            print(f"   Found {len(models)} model(s):")
            for model in models:
                model_name = model.get('name', 'unknown')
                print(f"     - {model_name}")
                if MODEL_NAME in model_name:
                    print(f"   ✅ Model {MODEL_NAME} is installed")
            
            if not any(MODEL_NAME in m.get('name', '') for m in models):
                print(f"   ❌ Model {MODEL_NAME} not found")
                print(f"   Solution: Run 'ollama pull {MODEL_NAME}'")
                return False
        else:
            print("   ❌ Could not list models")
            return False
    except Exception as e:
        print(f"   ❌ Error listing models: {e}")
        return False
    
    # Test 3: Test generation with the model
    print(f"\n3. Testing generation with {MODEL_NAME}...")
    try:
        test_prompt = "Say 'Hello, I'm working!' and nothing else."
        response = requests.post(
            f"{OLLAMA_URL}/api/generate",
            json={
                "model": MODEL_NAME,
                "prompt": test_prompt,
                "stream": False
            },
            timeout=15
        )
        
        if response.status_code == 200:
            result = response.json()
            generated_text = result.get('response', '')
            if generated_text:
                print("   ✅ Model responded successfully:")
                print(f"   Response: {generated_text[:100]}...")
            else:
                print("   ❌ Model returned empty response")
                return False
        else:
            print(f"   ❌ Generation failed: Status {response.status_code}")
            print(f"   Error: {response.text}")
            return False
            
    except requests.exceptions.Timeout:
        print("   ❌ Request timed out (model may be loading, try again)")
        return False
    except Exception as e:
        print(f"   ❌ Error during generation: {e}")
        return False
    
    # Test 4: Test the wellbeing API endpoint
    print("\n4. Testing wellbeing API endpoint...")
    try:
        response = requests.get("http://localhost:5000/api/test", timeout=5)
        if response.status_code == 200:
            data = response.json()
            if data.get('ready'):
                print("   ✅ Wellbeing API is ready")
                print(f"   Model status: {data.get('model_status')}")
            else:
                print("   ⚠️  API responded but not ready:")
                print(f"   Error: {data.get('error')}")
        else:
            print("   ℹ️  API server not running (run: python app.py)")
    except requests.exceptions.ConnectionError:
        print("   ℹ️  API server not running (run: python app.py)")
    except Exception as e:
        print(f"   ⚠️  Error testing API: {e}")
    
    print("\n" + "=" * 60)
    print("✅ ALL TESTS PASSED - System is ready!")
    print("=" * 60)
    print("\nNext steps:")
    print("1. Make sure the Flask server is running: python app.py")
    print("2. Make sure the frontend is running: npm run dev")
    print("3. Open http://localhost:8080 and click 'Wellbeing Support'")
    
    return True

if __name__ == "__main__":
    success = test_ollama()
    sys.exit(0 if success else 1)