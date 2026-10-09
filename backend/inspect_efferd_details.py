import re

with open(r"C:\Users\skand\.gemini\antigravity-ide\brain\30a8a511-498b-4a93-97c1-55a64f1e8516\.system_generated\steps\304\content.md", "r", encoding="utf-8") as f:
    html = f.read()

for comp_name in ['ChannelSalesChart', 'BillingHealth', 'DashboardActivity']:
    matches = [m.start() for m in re.finditer(comp_name, html)]
    print(comp_name, "matches:", len(matches))
    for m in matches:
        print("---", comp_name, "---")
        print(html[max(0, m-1200):min(len(html), m+100)])
