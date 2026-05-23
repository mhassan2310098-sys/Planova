from selenium import webdriver
from selenium.webdriver import Keys
from selenium.webdriver.edge.service import Service
from selenium.webdriver.common.by import By
import time

options = webdriver.EdgeOptions()
options.add_experimental_option("detach",True)

service_obj=Service()
driver=webdriver.Edge(options=options,service=service_obj)

driver.maximize_window()
driver.get("http://localhost:3000/login")
driver.find_element(By.CLASS_NAME,"form-input").send_keys("r@gmail.com")
driver.find_element(By.CSS_SELECTOR,"input[type='password']").send_keys("123456")
time.sleep(4)
driver.find_element(By.CLASS_NAME,"submit-btn").click()
