"""
Selenium Test for SeasonRecommendationsPage
Fills the form, waits 5 seconds, then clicks Get Destination Recommendations.

Requirements:
    pip install selenium webdriver-manager

Usage:
    python SeasonRecommendations.py
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

SEASON_URL = "http://localhost:3000/season-recommendations"
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
    driver.get(SEASON_URL)
    WebDriverWait(driver, WAIT_TIMEOUT).until(
        EC.presence_of_element_located((By.TAG_NAME, "h1"))
    )
    print("✅ Page loaded")

    # Select month — pick "December" from the first dropdown
    month_select = driver.find_elements(By.TAG_NAME, "select")[0]
    for option in month_select.find_elements(By.TAG_NAME, "option"):
        if option.get_attribute("value") == "December":
            option.click()
            break
    print("✅ Month selected: December")

    time.sleep(0.3)

    # Select travel style — pick "Adventure" from the second dropdown
    style_select = driver.find_elements(By.TAG_NAME, "select")[1]
    for option in style_select.find_elements(By.TAG_NAME, "option"):
        if option.get_attribute("value") == "Adventure":
            option.click()
            break
    print("✅ Travel style selected: Adventure")

    time.sleep(0.3)

    # Select 2 activities — Beach and Hiking
    activity_cards = driver.find_elements(By.CSS_SELECTOR, ".act-card")
    selected = 0
    for card in activity_cards:
        if selected >= 2:
            break
        card.click()
        selected += 1
        time.sleep(0.2)
    print(f"✅ {selected} activities selected")

    time.sleep(0.3)

    # Select budget range
    budget_select = driver.find_elements(By.TAG_NAME, "select")[2]
    for option in budget_select.find_elements(By.TAG_NAME, "option"):
        if option.get_attribute("value") == "10000-25000":
            option.click()
            break
    print("✅ Budget selected: ৳10,000 – ৳25,000")

    # Wait 5 seconds so you can see the filled form
    print("⏳ Waiting 5 seconds to review selections...")
    time.sleep(5)

    # Click the submit button
    submit_btn = driver.find_element(
        By.XPATH, "//button[contains(., 'Get Destination Recommendations')]"
    )
    submit_btn.click()
    print("✅ Submit clicked — loading recommendations...")

    # Wait for results to appear
    WebDriverWait(driver, WAIT_TIMEOUT).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, ".result-card"))
    )
    print("✅ Results loaded!")

    # Count how many recommendation cards appeared
    result_cards = driver.find_elements(By.CSS_SELECTOR, ".result-card")
    print(f"✅ {len(result_cards)} destination recommendations shown")

    # Keep browser open 5 seconds to see results
    print("⏳ Keeping browser open 5 seconds to review results...")
    time.sleep(5)

except Exception as e:
    print(f"❌ Error: {e}")
    time.sleep(5)

finally:
    driver.quit()
    print("✅ Browser closed")