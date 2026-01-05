
from playwright.sync_api import sync_playwright

def debug_home():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            print("Navigating to home...")
            page.goto("http://localhost:5173/")
            page.wait_for_timeout(2000)
            print("Taking screenshot...")
            page.screenshot(path="/home/jules/verification/debug_home.png")
            content = page.content()
            print("Page title:", page.title())
        except Exception as e:
            print("Error:", e)
        finally:
            browser.close()

if __name__ == "__main__":
    debug_home()
