#include <WiFi.h>
#include <FirebaseESP32.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include <MQ135.h>

#define WIFI_SSID "####"
#define WIFI_PASSWORD "####"
#define FIREBASE_HOST "smart-mushroom-greenhous-f2190-default-rtdb.asia-southeast1.firebasedatabase.app"
#define FIREBASE_AUTH "####"

FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

// Sensor pins
#define DHTPIN 14
#define DHTTYPE DHT11
#define MQ135_PIN 34
#define LDR_PIN 35
#define SOIL_PIN 32

DHT dht(DHTPIN, DHTTYPE);

// Actuator pins
#define FAN_PIN        15
#define HEATER_PIN     2
#define HUMIDIFIER_PIN 4
#define LIGHT_PIN      5
#define PUMP_PIN       18

void setup() {
  Serial.begin(115200);

  // WiFi connect
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("WiFi connected!");

  // Firebase setup
  config.host = FIREBASE_HOST;
  config.signer.tokens.legacy_token = FIREBASE_AUTH;
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);

  // Sensors
  dht.begin();

  // Actuators
  pinMode(FAN_PIN, OUTPUT);
  pinMode(HEATER_PIN, OUTPUT);
  pinMode(HUMIDIFIER_PIN, OUTPUT);
  pinMode(LIGHT_PIN, OUTPUT);
  pinMode(PUMP_PIN, OUTPUT);
}

void loop() {
  // Read sensors 
  float temperature = dht.readTemperature();
  float humidity    = dht.readHumidity();
  int mq135Value    = analogRead(MQ135_PIN);
  int ldrValue      = analogRead(LDR_PIN);
  int soilValue     = analogRead(SOIL_PIN);
  int soilPercent   = map(soilValue, 4095, 0, 0, 100);

  // Upload readings
  Firebase.RTDB.setFloat(&fbdo, "/greenhouse/readings/current/temperature", temperature);
  Firebase.RTDB.setFloat(&fbdo, "/greenhouse/readings/current/humidity", humidity);
  Firebase.RTDB.setInt(&fbdo, "/greenhouse/readings/current/co2ppm", mq135Value);
  Firebase.RTDB.setInt(&fbdo, "/greenhouse/readings/current/lightRaw", ldrValue);
  Firebase.RTDB.setInt(&fbdo, "/greenhouse/readings/current/soilPercent", soilPercent);

  // Update alerts
  int tempMax = Firebase.RTDB.getInt(&fbdo, "/greenhouse/thresholds/temperature/max") ? fbdo.intData() : 28;
  int tempMin = Firebase.RTDB.getInt(&fbdo, "/greenhouse/thresholds/temperature/min") ? fbdo.intData() : 20;
  int humMax  = Firebase.RTDB.getInt(&fbdo, "/greenhouse/thresholds/humidity/max") ? fbdo.intData() : 95;
  int humMin  = Firebase.RTDB.getInt(&fbdo, "/greenhouse/thresholds/humidity/min") ? fbdo.intData() : 80;
  int soilMin = Firebase.RTDB.getInt(&fbdo, "/greenhouse/thresholds/soilPercent/min") ? fbdo.intData() : 50;

  Firebase.RTDB.setString(&fbdo, "/greenhouse/alerts/temperature", (temperature > tempMax || temperature < tempMin) ? "ALERT" : "NORMAL");
  Firebase.RTDB.setString(&fbdo, "/greenhouse/alerts/humidity", (humidity < humMin || humidity > humMax) ? "LOW" : "NORMAL");
  Firebase.RTDB.setString(&fbdo, "/greenhouse/alerts/soilPercent", (soilPercent < soilMin) ? "LOW" : "NORMAL");
  Firebase.RTDB.setString(&fbdo, "/greenhouse/alerts/lightRaw", "NORMAL"); // adjust if needed
  Firebase.RTDB.setString(&fbdo, "/greenhouse/alerts/co2ppm", "NORMAL");   // calibrate MQ135 for ppm

  // Control actuators (manual mode) 
  if (Firebase.RTDB.getBool(&fbdo, "/greenhouse/control/fan")) digitalWrite(FAN_PIN, fbdo.boolData() ? HIGH : LOW);
  if (Firebase.RTDB.getBool(&fbdo, "/greenhouse/control/heater")) digitalWrite(HEATER_PIN, fbdo.boolData() ? HIGH : LOW);
  if (Firebase.RTDB.getBool(&fbdo, "/greenhouse/control/humidifier")) digitalWrite(HUMIDIFIER_PIN, fbdo.boolData() ? HIGH : LOW);
  if (Firebase.RTDB.getBool(&fbdo, "/greenhouse/control/light")) digitalWrite(LIGHT_PIN, fbdo.boolData() ? HIGH : LOW);
  if (Firebase.RTDB.getBool(&fbdo, "/greenhouse/control/pump")) digitalWrite(PUMP_PIN, fbdo.boolData() ? HIGH : LOW);

  //  Auto mode 
  if (Firebase.RTDB.getString(&fbdo, "/greenhouse/thresholds/mode") && fbdo.stringData() == "AUTO") {
    digitalWrite(FAN_PIN, (temperature > tempMax) ? HIGH : LOW);
    digitalWrite(HEATER_PIN, (temperature < tempMin) ? HIGH : LOW);
    digitalWrite(HUMIDIFIER_PIN, (humidity < humMin) ? HIGH : LOW);
    digitalWrite(PUMP_PIN, (soilPercent < soilMin) ? HIGH : LOW);
  }

  delay(5000);
}


