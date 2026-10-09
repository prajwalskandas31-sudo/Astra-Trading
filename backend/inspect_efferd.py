with open(r"C:\Users\skand\.gemini\antigravity-ide\brain\30a8a511-498b-4a93-97c1-55a64f1e8516\.system_generated\steps\304\content.md", "r", encoding="utf-8") as f:
    html = f.read()

pos = html.find('i(Wue,"Dashboard")')
print("Dashboard pos:", pos)
print("--- DASHBOARD IMPLEMENTATION ---")
print(html[pos-4000:pos+200])
