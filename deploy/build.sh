#!/bin/bash

# Simple build script for Netlify
echo "Starting build process..."

# Ensure the js/cube directory exists
mkdir -p js/cube

# Check if cuber.min.js exists
if [ -f "js/cube/cuber.min.js" ]; then
  echo "cuber.min.js already exists"
else
  echo "Error: cuber.min.js not found!"
  exit 1
fi

# Check if all required files exist
required_files=(
  "index.html"
  "css/style.css"
  "js/app.js"
  "js/photon.js"
  "js/solver/lbl_sol.js"
)

for file in "${required_files[@]}"; do
  if [ -f "$file" ]; then
    echo "$file exists"
  else
    echo "Error: $file not found!"
    exit 1
  fi
done

echo "Build completed successfully!"