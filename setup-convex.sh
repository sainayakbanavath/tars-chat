#!/bin/bash

echo ""
echo "═══════════════════════════════════════════════════════"
echo "  Tars Chat — Convex Setup"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "This will set up your Convex backend."
echo "When asked, choose: 'Login or create an account'"
echo "Then select: GitHub or Google to log in."
echo "When asked for a project name, type: tars-chat"
echo ""
echo "Press any key to start..."
read -n 1

npx convex dev
