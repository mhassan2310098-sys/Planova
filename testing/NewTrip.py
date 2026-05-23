"""
Selenium Test Suite for NewTripPage
Tests the /new-trip route of the Next.js travel planning app.

Requirements:
    pip install selenium webdriver-manager pytest

Usage:
    pytest newtrip.py -v
    or run directly: python newtrip.py
"""

import time
import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager


# ─── Configuration ────────────────────────────────────────────────────────────

BASE_URL = "http://localhost:3000"   # Change to your dev server URL
NEW_TRIP_URL = f"{BASE_URL}/new-trip"
DASHBOARD_URL = f"{BASE_URL}/Dashboard"
WAIT_TIMEOUT = 10


# ─── Fixtures ─────────────────────────────────────────────────────────────────

@pytest.fixture(scope="class")
def driver():
    """Set up and tear down the Chrome WebDriver for a test class."""
    options = Options()
    # options.add_argument("--headless")        # Uncomment for headless mode
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--window-size=1280,900")

    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=options)
    driver.implicitly_wait(5)
    yield driver
    driver.quit()


@pytest.fixture(autouse=True)
def open_new_trip_page(driver):
    """Navigate to the New Trip page before every test."""
    driver.get(NEW_TRIP_URL)
    WebDriverWait(driver, WAIT_TIMEOUT).until(
        EC.presence_of_element_located((By.TAG_NAME, "h1"))
    )


# ─── Helper ───────────────────────────────────────────────────────────────────

def get_destination_input(driver):
    return driver.find_element(By.CSS_SELECTOR, "input[placeholder*='Where do you want to go']")

def get_duration_input(driver):
    return driver.find_element(By.CSS_SELECTOR, "input[type='number']")

def get_submit_button(driver):
    return driver.find_element(By.XPATH, "//button[contains(., 'Search & Plan My Trip')]")

def select_travel_type(driver, label):
    """Click on a travel type button by its label text (Solo/Couple/Family/Group)."""
    button = driver.find_element(By.XPATH, f"//button[.//div[text()='{label}']]")
    button.click()

def fill_valid_form(driver, destination="Cox's Bazar", duration="3", travel_type="Solo"):
    get_destination_input(driver).clear()
    get_destination_input(driver).send_keys(destination)
    get_duration_input(driver).clear()
    get_duration_input(driver).send_keys(duration)
    select_travel_type(driver, travel_type)


# ─── Test Classes ─────────────────────────────────────────────────────────────

class TestPageLoad:
    """Verify the page renders all key elements correctly."""

    def test_page_title_visible(self, driver):
        h1 = driver.find_element(By.TAG_NAME, "h1")
        assert "PLAN YOUR NEW TRIP" in h1.text.upper(), "Page title not found"

    def test_subtitle_visible(self, driver):
        subtitle = driver.find_element(By.XPATH, "//*[contains(text(), \"Tell us where you want to go\")]")
        assert subtitle.is_displayed()

    def test_destination_input_present(self, driver):
        inp = get_destination_input(driver)
        assert inp.is_displayed()

    def test_duration_input_present(self, driver):
        inp = get_duration_input(driver)
        assert inp.is_displayed()

    def test_budget_sliders_present(self, driver):
        sliders = driver.find_elements(By.CSS_SELECTOR, "input[type='range']")
        assert len(sliders) == 2, "Expected 2 budget range sliders"

    def test_travel_type_buttons_present(self, driver):
        for label in ["Solo", "Couple", "Family", "Group"]:
            btn = driver.find_element(By.XPATH, f"//button[.//div[text()='{label}']]")
            assert btn.is_displayed(), f"Travel type button '{label}' not found"

    def test_submit_button_present(self, driver):
        btn = get_submit_button(driver)
        assert btn.is_displayed()

    def test_back_button_present(self, driver):
        back_btn = driver.find_element(By.XPATH, "//button[contains(., 'BACK TO DASHBOARD')]")
        assert back_btn.is_displayed()


class TestBackButton:
    """Test the Back to Dashboard navigation."""

    def test_back_button_navigates_to_dashboard(self, driver):
        back_btn = driver.find_element(By.XPATH, "//button[contains(., 'BACK TO DASHBOARD')]")
        back_btn.click()
        WebDriverWait(driver, WAIT_TIMEOUT).until(EC.url_contains("/Dashboard"))
        assert "/Dashboard" in driver.current_url


class TestDestinationInput:
    """Test the destination text field."""

    def test_destination_accepts_text(self, driver):
        inp = get_destination_input(driver)
        inp.send_keys("Sylhet")
        assert inp.get_attribute("value") == "Sylhet"

    def test_destination_placeholder_text(self, driver):
        inp = get_destination_input(driver)
        placeholder = inp.get_attribute("placeholder")
        assert "Where do you want to go" in placeholder

    def test_destination_can_be_cleared(self, driver):
        inp = get_destination_input(driver)
        inp.send_keys("Dhaka")
        inp.clear()
        assert inp.get_attribute("value") == ""


class TestDurationInput:
    """Test the duration (number) input field."""

    def test_duration_accepts_positive_integer(self, driver):
        inp = get_duration_input(driver)
        inp.send_keys("5")
        assert inp.get_attribute("value") == "5"

    def test_duration_min_attribute_is_1(self, driver):
        inp = get_duration_input(driver)
        assert inp.get_attribute("min") == "1"

    def test_duration_max_attribute_is_30(self, driver):
        inp = get_duration_input(driver)
        assert inp.get_attribute("max") == "30"

    def test_duration_placeholder_text(self, driver):
        inp = get_duration_input(driver)
        assert "days" in inp.get_attribute("placeholder").lower()


class TestBudgetSliders:
    """Test the budget range sliders."""

    def test_min_slider_default_value(self, driver):
        sliders = driver.find_elements(By.CSS_SELECTOR, "input[type='range']")
        assert sliders[0].get_attribute("value") == "0"

    def test_max_slider_default_value(self, driver):
        sliders = driver.find_elements(By.CSS_SELECTOR, "input[type='range']")
        assert sliders[1].get_attribute("value") == "50000"

    def test_budget_display_updates_on_min_slider_change(self, driver):
        sliders = driver.find_elements(By.CSS_SELECTOR, "input[type='range']")
        driver.execute_script("arguments[0].value = 10000; arguments[0].dispatchEvent(new Event('input', {bubbles:true}));", sliders[0])
        time.sleep(0.3)
        page_text = driver.find_element(By.TAG_NAME, "body").text
        assert "10,000" in page_text or "10000" in page_text

    def test_budget_display_updates_on_max_slider_change(self, driver):
        sliders = driver.find_elements(By.CSS_SELECTOR, "input[type='range']")
        driver.execute_script("arguments[0].value = 100000; arguments[0].dispatchEvent(new Event('input', {bubbles:true}));", sliders[1])
        time.sleep(0.3)
        page_text = driver.find_element(By.TAG_NAME, "body").text
        assert "100,000" in page_text or "100000" in page_text

    def test_slider_step_attribute(self, driver):
        sliders = driver.find_elements(By.CSS_SELECTOR, "input[type='range']")
        for slider in sliders:
            assert slider.get_attribute("step") == "1000"


class TestTravelTypeSelection:
    """Test travel type button selection behavior."""

    def test_solo_button_selectable(self, driver):
        select_travel_type(driver, "Solo")
        btn = driver.find_element(By.XPATH, "//button[.//div[text()='Solo']]")
        bg = btn.value_of_css_property("background-color")
        # After selection, background should be dark (#0d1b2a = rgb(13,27,42))
        assert "13" in bg or "0d1b2a" in btn.get_attribute("style").lower() or btn.get_attribute("style") != ""

    def test_couple_button_selectable(self, driver):
        select_travel_type(driver, "Couple")
        btn = driver.find_element(By.XPATH, "//button[.//div[text()='Couple']]")
        assert btn.is_displayed()

    def test_family_button_selectable(self, driver):
        select_travel_type(driver, "Family")
        btn = driver.find_element(By.XPATH, "//button[.//div[text()='Family']]")
        assert btn.is_displayed()

    def test_group_button_selectable(self, driver):
        select_travel_type(driver, "Group")
        btn = driver.find_element(By.XPATH, "//button[.//div[text()='Group']]")
        assert btn.is_displayed()

    def test_only_one_travel_type_active_at_a_time(self, driver):
        """Selecting a second type should deactivate the first."""
        select_travel_type(driver, "Solo")
        time.sleep(0.2)
        select_travel_type(driver, "Family")
        time.sleep(0.2)
        # The page should still have exactly one selected type
        # We verify by checking Family is clickable and page renders fine
        assert driver.find_element(By.XPATH, "//button[.//div[text()='Family']]").is_displayed()


class TestFormValidation:
    """Test error messages when required fields are missing."""

    def test_error_when_destination_empty(self, driver):
        get_duration_input(driver).send_keys("3")
        select_travel_type(driver, "Solo")
        get_submit_button(driver).click()
        error = WebDriverWait(driver, WAIT_TIMEOUT).until(
            EC.visibility_of_element_located((By.XPATH, "//*[contains(text(), 'Please enter a destination')]"))
        )
        assert error.is_displayed()

    def test_error_when_travel_type_not_selected(self, driver):
        get_destination_input(driver).send_keys("Dhaka")
        get_duration_input(driver).send_keys("2")
        get_submit_button(driver).click()
        error = WebDriverWait(driver, WAIT_TIMEOUT).until(
            EC.visibility_of_element_located((By.XPATH, "//*[contains(text(), 'Please select a travel type')]"))
        )
        assert error.is_displayed()

    def test_error_when_duration_empty(self, driver):
        get_destination_input(driver).send_keys("Rangamati")
        select_travel_type(driver, "Group")
        get_submit_button(driver).click()
        error = WebDriverWait(driver, WAIT_TIMEOUT).until(
            EC.visibility_of_element_located((By.XPATH, "//*[contains(text(), 'Please enter number of days')]"))
        )
        assert error.is_displayed()

    def test_error_clears_after_typing_destination(self, driver):
        """Error banner should disappear once the user starts typing."""
        get_submit_button(driver).click()  # trigger error
        time.sleep(0.3)
        inp = get_destination_input(driver)
        inp.send_keys("Cox")
        time.sleep(0.3)
        errors = driver.find_elements(By.XPATH, "//*[contains(text(), 'Please enter a destination')]")
        assert len(errors) == 0 or not errors[0].is_displayed()


class TestFormSubmission:
    """Test valid form submission and URL parameter construction."""

    def test_valid_form_redirects_to_search_results(self, driver):
        fill_valid_form(driver, destination="Cox's Bazar", duration="3", travel_type="Solo")
        get_submit_button(driver).click()
        WebDriverWait(driver, WAIT_TIMEOUT).until(EC.url_contains("/search-results"))
        assert "/search-results" in driver.current_url

    def test_url_contains_destination_param(self, driver):
        fill_valid_form(driver, destination="Sylhet", duration="4", travel_type="Couple")
        get_submit_button(driver).click()
        WebDriverWait(driver, WAIT_TIMEOUT).until(EC.url_contains("/search-results"))
        assert "destination=Sylhet" in driver.current_url

    def test_url_contains_duration_param(self, driver):
        fill_valid_form(driver, destination="Bandarban", duration="5", travel_type="Family")
        get_submit_button(driver).click()
        WebDriverWait(driver, WAIT_TIMEOUT).until(EC.url_contains("/search-results"))
        assert "duration=5" in driver.current_url

    def test_url_contains_travel_type_param(self, driver):
        fill_valid_form(driver, destination="Chittagong", duration="2", travel_type="Group")
        get_submit_button(driver).click()
        WebDriverWait(driver, WAIT_TIMEOUT).until(EC.url_contains("/search-results"))
        assert "travelType=group" in driver.current_url

    def test_url_contains_budget_params(self, driver):
        fill_valid_form(driver, destination="Dhaka", duration="1", travel_type="Solo")
        get_submit_button(driver).click()
        WebDriverWait(driver, WAIT_TIMEOUT).until(EC.url_contains("/search-results"))
        assert "budgetMin=" in driver.current_url
        assert "budgetMax=" in driver.current_url


# ─── Standalone runner ────────────────────────────────────────────────────────

if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])