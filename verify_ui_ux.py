
from playwright.sync_api import sync_playwright

def verify_ui_ux():
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

        # 3. Simulate Capture
        print("Starting Capture...")
        capture_btn = page.locator("button.rounded-full.border-4")

        # Wait for camera to init
        page.wait_for_timeout(3000)

        # Loop for 4 captures with robust waiting
        for i in range(4):
            print(f"Capture {i+1}...")
            try:
                capture_btn.wait_for(state="visible", timeout=10000)
                if page.url.endswith("/review"):
                     break
                capture_btn.click()
            except Exception as e:
                print(f"Capture {i+1} error/skipped: {e}")

            page.wait_for_timeout(5000)

        # 4. Wait for Review Screen
        print("Waiting for Review Screen...")
        page.wait_for_selector("text=Layout", timeout=30000)

        # 5. Add Sticker
        print("Adding Sticker...")
        # Assuming the sticker button (emoji) has text like "😎"
        # We need to find a button in the sticker section
        page.get_by_text("😎").click()

        # 6. Verify Sticker is Draggable
        # The sticker should be added to the DOM
        sticker_el = page.locator("text=😎")
        if sticker_el.is_visible():
            print("Sticker added successfully.")

            # Drag it
            print("Dragging sticker...")
            box = sticker_el.bounding_box()
            if box:
                page.mouse.move(box["x"] + box["width"] / 2, box["y"] + box["height"] / 2)
                page.mouse.down()
                page.mouse.move(box["x"] + 100, box["y"] + 100) # Move 100px
                page.mouse.up()
                print("Sticker dragged.")
        else:
            print("Sticker failed to appear.")

        # 7. Select Frame Preset
        print("Selecting 'Neon' Frame...")
        # We added title="Neon" to the button
        page.get_by_title("Neon").click()

        # 8. Take Screenshot
        page.wait_for_timeout(1000)
        screenshot_path = "/home/jules/verification/ui_ux_improvements.png"
        page.screenshot(path=screenshot_path)
        print(f"Screenshot saved to {screenshot_path}")

        browser.close()

if __name__ == "__main__":
    verify_ui_ux()
