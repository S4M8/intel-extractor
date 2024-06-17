# Intel Extractor

## Overview
This script is designed to automate the process of updating member information for a Star Citizen organization. It operates within an Electron application and targets the admin view of organization members on robertspaceindustries.com. The script utilizes Puppeteer, a Node.js library, to control a Chromium-based browser programmatically for scraping web content. Additionally, it employs the Puppeteer Extra plugin with StealthPlugin to enhance scraping capabilities by evading detection mechanisms on the website.

## Dependencies
  - Puppeteer Extra: A version of Puppeteer that supports plugins.
  - Stealth Plugin: A plugin for Puppeteer Extra to make automation less detectable.
  - File System (fs): A Node.js module to handle file system operations.
  - CSV-Parse: A library for parsing CSV data synchronously.
  - CSV-Stringify: A library for stringifying objects into CSV format synchronously.

## Features
  - Automated Login: Logs into the Star Citizen website using provided credentials.
  - Two-Factor Authentication (2FA) Handling: Waits for manual input of 2FA code.
  - Member Scraping: Scrapes member information from the organization's admin view.
  - Data Extraction: Extracts member details such as name, nickname, and profile URL.
  - CSV Data Handling: Reads existing member data from a CSV file, updates it with the scraped information, and writes the updated data back to a new CSV file.

## How It Works
  - Initialization: The script initializes Puppeteer with the StealthPlugin and sets up necessary URLs and paths.
  - Browser Launch: Launches a Chromium browser instance with a specified executable path (e.g., Microsoft Edge).
  - Navigation and Login: Navigates to the Star Citizen website, handles modal dialogs, and logs in using th-e provided credentials.
  - 2FA Handling: Waits 20 seconds for the user to manually input the 2FA code.
  - Member Page Navigation: Navigates to the organization's member admin page.
  - Member Information Scraping: Scrolls through the member list, scraping information for each member and storing it in an array.
  - Data Processing: Processes the scraped member information, including visiting individual member pages for additional details.
  - CSV Handling: Reads an existing CSV file for member data, updates it with the newly scraped information, and writes the updated data to a new CSV file.
  - Cleanup: Closes the browser instance.

## Usage: admin script
  - Extract zip file 
  - Provide existing CSV to ./resources/app/src/assets/${existing.csv}
  - Run ./intel-extractor-win32-x64/intel-extractor.exe
  - Enter username and password credentials
  - Select the "_admin" button
  - Enter two factor authentication challenge
  - Review generated CSV, style as needed

## Usage: scan script
  - Run ./intel-extractor-win32-x64/intel-extractor.exe
  - Enter Organization SID
  - Select "_scan" button
  - Review generated CSV, style as needed
