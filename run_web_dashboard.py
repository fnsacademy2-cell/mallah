import os
import sys
import webbrowser
import threading
import time

def start_server():
    import server
    port = int(os.environ.get("PORT", 5000))
    server.app.run(host="127.0.0.1", port=port, debug=False)

def open_browser():
    time.sleep(1.2)
    url = "http://127.0.0.1:5000"
    print(f"\nOpening Mallah Traders Web MIS Dashboard in your browser: {url}\n")
    webbrowser.open(url)

if __name__ == "__main__":
    t = threading.Thread(target=open_browser)
    t.daemon = True
    t.start()
    start_server()
