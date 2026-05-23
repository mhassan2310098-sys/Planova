"""
Selenium Test for CustomizeTripPage
Fills the form, waits 5 seconds, then clicks Generate My Itinerary.

Requirements:
    pip install selenium webdriver-manager

Usage:
    python CustomizeTrip.py
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

CUSTOMIZE_URL = (
    "http://localhost:3000/customize-trip"
    "?destination=Cox%27s+Bazar"
    "&duration=3"
    "&travelType=couple"
    "&budgetMin=5000"
    "&budgetMax=30000"
)
WAIT_TIMEOUT = 15

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
    driver.get(CUSTOMIZE_URL)
    print("✅ Page opened")

    # Wait for hotels to load
    WebDriverWait(driver, WAIT_TIMEOUT).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, ".hotel-card"))
    )
    print("✅ Hotels loaded")

    # Select the first hotel
    hotel_cards = driver.find_elements(By.CSS_SELECTOR, ".hotel-card")
    if hotel_cards:
        hotel_cards[0].click()
        print(f"✅ Hotel selected: {hotel_cards[0].find_element(By.TAG_NAME, 'p').text}")
    else:
        print("⚠️ No hotel cards found")

    time.sleep(0.5)

    # Select first 3 activities
    activity_cards = driver.find_elements(By.CSS_SELECTOR, ".activity-card")
    selected_count = 0
    for card in activity_cards[:3]:
        card.click()
        selected_count += 1
        time.sleep(0.2)
    print(f"✅ {selected_count} activities selected")

    time.sleep(0.5)

    # Set start date
    start_input = driver.find_element(By.CSS_SELECTOR, "input[type='date']")
    driver.execute_script("arguments[0].value = '2026-07-01';", start_input)
    driver.execute_script("arguments[0].dispatchEvent(new Event('input', {bubbles:true}));", start_input)
    driver.execute_script("arguments[0].dispatchEvent(new Event('change', {bubbles:true}));", start_input)
    print("✅ Start date set: 2026-07-01")

    time.sleep(0.3)

    # Set end date
    date_inputs = driver.find_elements(By.CSS_SELECTOR, "input[type='date']")
    if len(date_inputs) > 1:
        driver.execute_script("arguments[0].value = '2026-07-03';", date_inputs[1])
        driver.execute_script("arguments[0].dispatchEvent(new Event('input', {bubbles:true}));", date_inputs[1])
        driver.execute_script("arguments[0].dispatchEvent(new Event('change', {bubbles:true}));", date_inputs[1])
        print("✅ End date set: 2026-07-03")

    # Wait 5 seconds so you can see the filled form
    print("⏳ Waiting 5 seconds to review selections...")
    time.sleep(5)

    # Click Generate My Itinerary
    generate_btn = driver.find_element(By.XPATH, "//button[contains(., 'Generate My Itinerary')]")
    generate_btn.click()
    print("✅ Generate button clicked — AI generating itinerary...")

    # Wait for redirect to my-trip
    WebDriverWait(driver, 30).until(EC.url_contains("/my-trip"))
    print(f"✅ Redirected to: {driver.current_url}")

    # Keep browser open 5 seconds to see result
    time.sleep(5)

except Exception as e:
    print(f"❌ Error: {e}")
    time.sleep(5)

finally:
    driver.quit()
    print("✅ Browser closed")