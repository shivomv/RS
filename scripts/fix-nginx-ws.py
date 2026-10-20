path = "/etc/nginx/sites-available/rs-api"
with open(path, "r") as f:
    content = f.read()

target = "proxy_http_version 1.1;"
ws_headers = """proxy_http_version 1.1;

        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";"""

if "Upgrade $http_upgrade" not in content:
    content = content.replace(target, ws_headers, 1)
    with open(path, "w") as f:
        f.write(content)
    print("SUCCESS: Nginx configuration updated with WebSocket upgrade headers.")
else:
    print("ALREADY_SET: WebSocket upgrade headers already exist.")
