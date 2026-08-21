#!/usr/bin/env python3
"""
HTTP Endpoint and Asset Loading Test for Speedway Scorecard PWA
"""

import http.server
import socketserver
import threading
import urllib.request
import time
import os
import sys

def test_server():
    workspace = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    os.chdir(workspace)

    PORT = 8991
    Handler = http.server.SimpleHTTPRequestHandler

    # Allow fast address reuse
    socketserver.TCPServer.allow_reuse_address = True
    httpd = socketserver.TCPServer(("", PORT), Handler)

    server_thread = threading.Thread(target=httpd.serve_forever, daemon=True)
    server_thread.start()
    time.sleep(0.3)

    urls = [
        f"http://localhost:{PORT}/index.html",
        f"http://localhost:{PORT}/manifest.webmanifest",
        f"http://localhost:{PORT}/sw.js",
        f"http://localhost:{PORT}/css/app.css",
        f"http://localhost:{PORT}/js/app.js",
        f"http://localhost:{PORT}/js/models/speedway-rules.js",
        f"http://localhost:{PORT}/js/services/storage.js",
        f"http://localhost:{PORT}/js/services/exporter.js",
        f"http://localhost:{PORT}/js/views/heat-view.js",
        f"http://localhost:{PORT}/js/views/scorecard-view.js",
        f"http://localhost:{PORT}/js/views/riders-view.js",
        f"http://localhost:{PORT}/js/views/stats-view.js",
        f"http://localhost:{PORT}/js/views/match-setup-view.js",
        f"http://localhost:{PORT}/icons/icon.svg",
    ]

    failed = []
    for url in urls:
        try:
            req = urllib.request.urlopen(url)
            code = req.getcode()
            if code == 200:
                print(f"✓ [{code}] {url}")
            else:
                failed.append(f"HTTP {code}: {url}")
        except Exception as e:
            failed.append(f"Error fetching {url}: {str(e)}")

    httpd.shutdown()
    httpd.server_close()

    if failed:
        print("\n❌ Server test failed for:")
        for f in failed:
            print(f"  - {f}")
        sys.exit(1)
    else:
        print("\n All PWA web assets served with HTTP 200 OK!")

if __name__ == '__main__':
    test_server()

