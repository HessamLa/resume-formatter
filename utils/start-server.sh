#!/bin/bash
# Simple script to start the local HTTP server

echo "Starting HTTP server on port 8000..."
echo "Open your browser to: http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

python3 -m http.server 8000