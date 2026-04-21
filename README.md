# Smart Mushroom Cultivation System  
### IoT-Based Greenhouse Monitoring & Automation

An IoT-powered smart farming system designed to monitor and control environmental conditions for mushroom cultivation using ESP32, sensors, Firebase, and real-time web & mobile dashboards.

---

## Overview

Mushroom cultivation requires precise control of environmental factors such as temperature, humidity, CO₂ levels, and light. Manual monitoring is inefficient and often leads to inconsistent yields.

This project introduces a **real-time, automated greenhouse monitoring system** that enables farmers to remotely monitor and control conditions using web and mobile applications.

---

## Problem

- Lack of continuous environmental monitoring  
- Dependence on manual methods  
- No proper data recording or analysis  
- No remote monitoring capability  
- High labor effort and inefficiency  

---

## Solution

This system provides:

- Real-time environmental monitoring using sensors  
- Cloud-based data storage with Firebase  
- Interactive web dashboard for visualization  
- Mobile application for remote access  
- Automated control of greenhouse conditions  

---

## System Architecture

Sensors → ESP32 → Firebase → Web Dashboard & Mobile App → Actuators

The system follows a layered IoT architecture:
- **Sensor Layer** – Collects environmental data  
- **Processing Layer** – ESP32 processes and sends data  
- **Cloud Layer** – Firebase stores and syncs data  
- **Application Layer** – Web & mobile interfaces  
- **Actuation Layer** – Controls fans, humidifiers, etc.  

---

## Tech Stack

### Hardware
- ESP32 Microcontroller  
- DHT11 (Temperature & Humidity Sensor)  
- MQ-135 (Gas/CO₂ Sensor)  
- LDR (Light Sensor)  
![image alt](https://github.com/Lochana-Ilangathilake/Smart-Mushroom-Farm-Monitoring-Automation/blob/30e56230ef61f213c2d4099a5a0af2b0a5985b81/Hardware/ESP32%20Relay%20modules%20and%20breadboard%20connections.jpeg)

### Backend
- Firebase Realtime Database  
- Firebase Authentication  

![image alt](https://github.com/Lochana-Ilangathilake/Smart-Mushroom-Farm-Monitoring-Automation/blob/70d3a7f6886be7e97245bef2029bf4424ac8c067/Firebase/Firebase%20data.png)

### Web Dashboard
- React + Vite  
- Tailwind CSS  
- Recharts (Data Visualization)  
 ![image alt](https://github.com/Lochana-Ilangathilake/Smart-Mushroom-Farm-Monitoring-Automation/blob/4d34faa62624d0fcda9969b0b86b84dd719f3cef/Documentation/web%20dashboard.png)

### Mobile Application
- Android (Java)  
- MVVM Architecture  
- Firebase Integration  
![image alt](https://github.com/Lochana-Ilangathilake/Smart-Mushroom-Farm-Monitoring-Automation/blob/30e56230ef61f213c2d4099a5a0af2b0a5985b81/Documentation/mobile%20dashboard.png)
---

## Key Features

- Real-time temperature & humidity monitoring  
- Live data visualization with charts  
- Remote monitoring via mobile app  
- Threshold-based alerts & notifications  
- Historical data tracking  
- Manual & automatic actuator control  
- User authentication system  

---
## Repository Structure

- **Documentation/** → Detailed technical docs, setup guides, testing reports 
- **Firebase/** → Database rules and configs  
- **Hardware/** → ESP32 Arduino code and sensor integration  
- **Smart Mushroom Web Dashboard/** → Web interface code  
- **Smart_Mushroom_Mobile_App/** → Will be added in a **separate repository**  
