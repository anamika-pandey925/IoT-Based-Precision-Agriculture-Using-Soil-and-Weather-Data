#include <Servo.h>

// --- Configuration ---
#define SOIL_PIN A0
#define WATER_LEVEL_PIN A1 // Pin for Overflow Detection
#define DHT_PIN 2          // Connect DHT data pin here
#define SERVO_PIN 9
#define BUZZER_PIN 8       // Pin for Buzzer Alert
#define LED_PIN 13
#define PIR_PIN 3          // Pin for Animal/Bird Detection

// For DHT (Simulated here if library not generic, but standard structure below)
// If you have a DHT11/22, include <DHT.h> and uncomment relevant lines
// #include "DHT.h"
// #define DHTTYPE DHT11
// DHT dht(DHT_PIN, DHTTYPE);

Servo myServo;
String command;

// Local Safety Vars
bool isMotorRunning = false;
unsigned long motorStartTime = 0;
const unsigned long MAX_MOTOR_RUNTIME = 15000; // 15 seconds max continuous
bool overflowCutoff = false;

void setup() {
  Serial.begin(9600);
  pinMode(SOIL_PIN, INPUT);
  pinMode(WATER_LEVEL_PIN, INPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(LED_PIN, OUTPUT);
  pinMode(PIR_PIN, INPUT);
  
  myServo.attach(SERVO_PIN);
  myServo.write(0); // Initial position
  
  // dht.begin();
  
  Serial.println("Arduino Initialized");
}

void loop() {
  // 1. Read Sensors
  int soilRaw = analogRead(SOIL_PIN);
  int soilPercent = map(soilRaw, 1023, 0, 0, 100); // Adjust min/max based on calibration
  
  // Simulated Temp/Hum if no sensor library (Replace with dht.readTemperature() etc.)
  float temperature = 25.0 + (random(0, 100) / 10.0); 
  float humidity = 60.0 + (random(0, 200) / 10.0);
  
  // float humidity = dht.readHumidity();

// 3. Independent Water Overflow Detection (Read Physical Water Sensor)
  int waterLevel = analogRead(WATER_LEVEL_PIN);
  bool physicalOverflow = (waterLevel > 600); // 600 is arbitrary threshold for completely submerged

  if (physicalOverflow && !overflowCutoff) {
    overflowCutoff = true; // Trigger failsafe
  }

  // 3b. Animal/Bird Detection (Read PIR Sensor)
  bool animalDetected = digitalRead(PIR_PIN);

  // 4. Heartbeat & Safety Status
  String systemStatus = "OK";
  if (overflowCutoff) {
    systemStatus = "OVERFLOW_LIMIT_REACHED";
    // Trigger Buzzer Alert continuously if overflowing
    digitalWrite(BUZZER_PIN, HIGH); 
  } else {
    // Note: Python will send BUZZER_ON/OFF, so we don't force LOW here if animal is detected by Python logic
    // but Arduino doesn't know Python's state directly unless we rely on Python's BUZZER_ON command.
    // We already remove digitalWrite(BUZZER_PIN, LOW) from the 'else' so Python can control it, or we keep it.
    // ACTUALLY: if we just keep it, the buzzer will flutter and shut off instantly if Python turns it on!
    // Yes! `digitalWrite(BUZZER_PIN, LOW)` overrides Python! 
    // I should only silence buzzer if neither overflow NOR Python commanded it.
    // Wait, the previous code had `digitalWrite(BUZZER_PIN, LOW)`
  }

  // 5. Send Data as JSON
  // Format: {"temperature": 25.5, "humidity": 60, "moisture": 45, "status": "OK", "animal_detected": true/false}
  Serial.print("{\"temperature\":");
  Serial.print(temperature);
  Serial.print(", \"humidity\":");
  Serial.print(humidity);
  Serial.print(", \"moisture\":");
  Serial.print(soilPercent);
  Serial.print(", \"status\":\"");
  Serial.print(systemStatus);
  Serial.print("\", \"animal_detected\":");
  Serial.print(animalDetected ? "true" : "false");
  Serial.println("}");

  // 6. Check for Incoming Commands from Python
  if (Serial.available() > 0) {
    command = Serial.readStringUntil('\n');
    command.trim();
    
    if (command == "MOTOR_ON" && !overflowCutoff) {
      if (!isMotorRunning) {
        motorStartTime = millis();
        isMotorRunning = true;
      }
      myServo.write(90); // Open Valve
      digitalWrite(LED_PIN, HIGH);
    } else if (command == "MOTOR_OFF" || command == "RESET_OVERFLOW") {
      if (command == "RESET_OVERFLOW") {
        overflowCutoff = false;
        digitalWrite(BUZZER_PIN, LOW); // Silence Buzzer
      }
      isMotorRunning = false;
      myServo.write(0);  // Close Valve
      digitalWrite(LED_PIN, LOW);
    } else if (command == "BUZZER_ON") {
      digitalWrite(BUZZER_PIN, HIGH);
    } else if (command == "BUZZER_OFF" && !overflowCutoff) {
      digitalWrite(BUZZER_PIN, LOW);
    }
  }

  // 7. Local Failsafe: Auto Shut-Off
  if (isMotorRunning && (millis() - motorStartTime > MAX_MOTOR_RUNTIME)) {
    myServo.write(0);
    digitalWrite(LED_PIN, LOW);
    isMotorRunning = false;
    overflowCutoff = true; // Block further activation until reset
    digitalWrite(BUZZER_PIN, HIGH); // Sound the buzzer on timeout
  }
  
  delay(2000); // Wait 2 seconds before next reading
}
