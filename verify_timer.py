
from playwright.sync_api import sync_playwright

def verify_timer_feature():
    print("Navigating to home page...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            permissions=["camera"],
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        )
        page = context.new_page()

        # 1. Navigate to Home
        page.goto("http://localhost:5173/")

        # 2. Click "Start Photo Booth"
        print("Starting Booth...")
        page.get_by_text("Start Photo Booth").click()

        # 3. Verify Timer UI Exists
        print("Checking for Timer buttons...")
        # Should have buttons for 3s, 5s, 10s
        page.wait_for_selector("text=Timer")

        btn_5s = page.get_by_role("button", name="5s")
        if btn_5s.is_visible():
            print("5s button found.")
        else:
            print("5s button NOT found.")
            return

        # 4. Select 5s Timer
        print("Selecting 5s...")
        btn_5s.click()

        # 5. Start Session
        print("Starting Session...")
        # The big red/white start button
        page.locator("button[aria-label='Start Photo Booth']").click()

        # 6. Verify Countdown Starts at 5 (or close to it)
        # The countdown component usually shows a big number
        print("Checking countdown...")
        # Wait a tick for react to render
        page.wait_for_timeout(500)

        # We look for text "5" or "4" (if it ticked immediately)
        # Depending on implementation, it might show "5" initially.
        try:
             # Just take a screenshot to verify visual "5"
             screenshot_path = "/home/jules/verification/timer_verification.png"
             page.screenshot(path=screenshot_path)
             print(f"Screenshot saved to {screenshot_path}")

             # Also try to find the element
             if page.get_by_text("5").is_visible() or page.get_by_text("4").is_visible():
                 print("Countdown validated (saw 5 or 4).")
             else:
                 print("Warning: Could not strictly validate text '5'. Check screenshot.")

        except Exception as e:
            print("Error verifying countdown:", e)

        browser.close()

if __name__ == "__main__":
    verify_timer_feature()
