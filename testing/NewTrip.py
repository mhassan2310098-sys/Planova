"""
Selenium Test for NewTripPage
Fills the form, waits 5 seconds, then clicks submit.

Requirements:
    pip install selenium webdriver-manager pytest

Usage:
    python NewTrip.py
"""

import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager

# ─── Configuration ────────────────────────────────────────────────────────────

NEW_TRIP_URL = "http://localhost:3000/Newtrip"
WAIT_TIMEOUT = 10

# ─── Setup ────────────────────────────────────────────────────────────────────

options = Options()
options.add_argument("--no-sandbox")
options.add_argument("--disable-dev-shm-usage")
options.add_argument("--window-size=1280,900")

service = Service(ChromeDriverManager().install())
driver = webdriver.Chrome(service=service, options=options)
driver.implicitly_wait(5)

# ─── Run ──────────────────────────────────────────────────────────────────────

try:
    # Open the page
    driver.get(NEW_TRIP_URL)
    WebDriverWait(driver, WAIT_TIMEOUT).until(
        EC.presence_of_element_located((By.TAG_NAME, "h1"))
    )
    print("✅ Page loaded")

    # Fill destination
    destination_input = driver.find_element(By.CSS_SELECTOR, "input[placeholder*='Where do you want to go']")
    destination_input.clear()
    destination_input.send_keys("Cox's Bazar")
    print("✅ Destination filled")

    # Fill duration
    duration_input = driver.find_element(By.CSS_SELECTOR, "input[type='number']")
    duration_input.clear()
    duration_input.send_keys("3")
    print("✅ Duration filled")

    # Set budget sliders
    sliders = driver.find_elements(By.CSS_SELECTOR, "input[type='range']")
    driver.execute_script("arguments[0].value = 5000; arguments[0].dispatchEvent(new Event('input', {bubbles:true}));", sliders[0])
    driver.execute_script("arguments[0].value = 30000; arguments[0].dispatchEvent(new Event('input', {bubbles:true}));", sliders[1])
    print("✅ Budget set: ৳5,000 - ৳30,000")

    # Select travel type
    travel_type_btn = driver.find_element(By.XPATH, "//button[.//div[text()='Solo']]")
    travel_type_btn.click()
    print("✅ Travel type selected: Solo")

    # Wait 5 seconds so you can see the filled form
    print("⏳ Waiting 5 seconds...")
    time.sleep(5)

    # Click submit
    submit_btn = driver.find_element(By.XPATH, "//button[contains(., 'Search & Plan My Trip')]")
    submit_btn.click()
    print("✅ Submit clicked")

    # Wait for redirect
    WebDriverWait(driver, WAIT_TIMEOUT).until(EC.url_contains("/search-results"))
    print(f"✅ Redirected to: {driver.current_url}")

    # Keep browser open for 5 seconds to see result
    time.sleep(5)

except Exception as e:
    print(f"❌ Error: {e}")

finally:
    driver.quit()
    print("✅ Browser closed")