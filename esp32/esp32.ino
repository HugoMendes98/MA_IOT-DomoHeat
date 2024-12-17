#include <Arduino.h>
#include <SPI.h>
#include <WiFi.h>
#include <Wire.h>

// https://github.com/malokhvii-eduard/arduino-bme280 (available in the library manager)
#include <Bme280.h>
// https://github.com/256dpi/arduino-mqtt (available in the library manager)
#include <MQTT.h>
// https://arduinojson.org/?utm_source=meta&utm_medium=library.properties (available in the library manager)
#include <ArduinoJson.h>

#include "./config.h"
#include "./config.board.h"
#include "./wifi.h"

Bme280TwoWire bme;

WiFiClient net; // This must be global-scoped
MQTTClient mqttClient(4096); // 4kB should be enough

// Set in `setup`
String DEVICE_ID = "";

void messageReceived(String &topic, String &payload) {
  Serial.println("incoming: " + topic + " - " + payload);

  JsonDocument doc;
  auto error = deserializeJson(doc, payload);
  if (error) {
    Serial.println("Could not JSON deserialize");
    return;
  }
  
  if (!doc["temperature"].is<double>()) {
    Serial.println("'temperature' not found in JSON");
    return;
  }

  double temp = doc["temperature"];
  Serial.print("Received 'temperature' of: ");
  Serial.println(temp);

  digitalWrite(PIN_LED_10, LOW);
  digitalWrite(PIN_LED_20, LOW);
  digitalWrite(PIN_LED_30, LOW);

  if (temp < 10) {
    return;
  }

  digitalWrite(PIN_LED_10, HIGH);
  if (temp < 20) {
    return;
  }
  
  digitalWrite(PIN_LED_20, HIGH);
  if (temp < 30) {
    return;
  }

  digitalWrite(PIN_LED_30, HIGH);

  // Note: Do not use the client in the callback to publish, subscribe or
  // unsubscribe as it may cause deadlocks when other things arrive while
  // sending and receiving acknowledgments. Instead, change a global variable,
  // or push to a queue and handle it in the loop after calling `client.loop()`.
}


void setup() {
  // Some boards work best if we also make a serial connection
  Serial.begin(115200);
  while(!Serial) {}

  char uid[32];
  sprintf(uid, "esp-%012llx", ESP.getEfuseMac());
  DEVICE_ID+= String(uid);

  pinMode(PIN_LED_10, OUTPUT);
  pinMode(PIN_LED_20, OUTPUT);
  pinMode(PIN_LED_30, OUTPUT);

  pinMode(PIN_BME_GND, OUTPUT);
  pinMode(PIN_BME_VLT, OUTPUT);

  // Work as the alimentation of the module
  digitalWrite(PIN_BME_VLT, LOW);
  digitalWrite(PIN_BME_VLT, HIGH);

  // https://github.com/malokhvii-eduard/arduino-bme280/blob/master/examples/TwoWire/TwoWire.ino
  Wire.begin(PIN_BME_DATA, PIN_BME_CLK);
  bme.begin(Bme280TwoWireAddress::Primary);

  // WIFI - https://docs.arduino.cc/retired/library-examples/wifi-library/ConnectWithWPA/
  // check for the presence of the shield:
  if (WiFi.status() == WL_NO_SHIELD) {
    Serial.println("WiFi shield not present");
    // don't continue:
    while (true);
  }

  WiFi.mode(WIFI_STA);
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print("Attempting to connect to WPA SSID: ");
    Serial.println(WIFI_SSID);

    // Connect to WPA/WPA2 network:
    WiFi.begin(WIFI_SSID, WIFI_PASS);

    // wait 2.5 seconds (for connection and retry)
    delay(2500);
  }

  Serial.print("You're connected to the network");
  printCurrentNet();
  printWifiData();

  // MQTT - https://github.com/256dpi/arduino-mqtt
  Serial.print("Connecting to MQTT at ");
  Serial.print(MQTT_HOST);
  Serial.print(":");
  Serial.print(MQTT_PORT);
  
  mqttClient.begin(MQTT_HOST, MQTT_PORT, net);
  mqttClient.onMessage(messageReceived);

  Serial.print("\nMQTT connecting...");
  while (!mqttClient.connect(DEVICE_ID.c_str())) {
    Serial.print(".");
    delay(1000);
  }
  Serial.println("");
  Serial.println("MQTT connected!");

  mqttClient.subscribe("/sensor/" + DEVICE_ID + "/set");
}

unsigned long lastMillis = 0;
void loop() {
  mqttClient.loop();

  if (millis() - lastMillis < SYNC_TIME) {
    return;
  }

  lastMillis = millis();

  JsonDocument doc;
  // Not data
  doc["type"] = "sensor";
  doc["id"] = DEVICE_ID;

  doc["humidity"] = bme.getHumidity();
  doc["pressure"] = bme.getPressure();
  doc["temperature"] = bme.getTemperature();

  String output;
  serializeJson(doc, output);

  mqttClient.publish("/sensor/" + DEVICE_ID + "/sync", output);
}
