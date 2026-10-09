import re

with open("script_121.txt", "r", encoding="utf-8") as f:
    s = f.read()

urls = re.findall(r"https://cdn\.21st\.dev/reapollo/efferd-dashboard-2/default/[a-zA-Z0-9\._\-]+", s)
print("Found URLs:", set(urls))

# Also search for code filename patterns
codes = re.findall(r"code\.[a-zA-Z0-9\._\-]+", s)
print("Code patterns:", set(codes))

# Search for any other 21st cdn urls
all_cdn = re.findall(r"https://cdn\.21st\.dev/[^\s\"\'\\]+", s)
print("All CDN URLs (count):", len(all_cdn))
for u in set(all_cdn):
    if "efferd" in u:
        print("  Efferd CDN:", u)
