# Femilia Architecture Overview

## System Overview

Femilia is a modular humanoid robot platform. The system follows a layered architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                     APPLICATION LAYER                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │   Web    │  │   API    │  │   Audio │  │   Vision │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
├─────────────────────────────────────────────────────────────┤
│                        CONTROL LAYER                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Motion Controller                       │  │
│  │  Inverse Kinematics → Servo PWM (PCA9685)          │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Expression Controller                  │  │
│  │  Emotion State → Display Buffer (SSD1306)         │  │
│  └──────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│                         FIRMWARE LAYER                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              ESP32 Real-Time Runtime               │  │
│  │  FreeRTOS Tasks, Sensor Fusion, Servo Control     │  │
│  └──────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│                          HARDWARE LAYER                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │   MCU    │  │   Motor  │  │   Display│  │  Sensors│  │
│  │ ESP32    │  │  Servo   │  │  OLED    │  │ IMU/Cam │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### Audio Pipeline

```
Audio Input (INMP441)
      │
      ▼ I2S
Audio Codec (WM8960)
      │
      ▼ I2S
ESP32 → Wake Word Detection → Speech-to-Text (WiFi) → Command Parser
      │
      └── Expression/Behavior Decision
            │
            ▼
Servo/Motor + Display Outputs
```

### Vision Pipeline

```
Camera (OV5640)
      │
      ▼ SPI
ESP32 → Frame Buffer
      │
      ├── YOLO Detection (WiFi Transfer)
      ├── Face Tracking
      └── Gesture Recognition
            │
            ▼
Behavior Planning → Motor Commands
```

## Control Loop

The primary control loop runs at 50 Hz:

1. Read sensor inputs (IMU, camera, audio)
2. Compute desired joint angles (IK solver)
3. Generate PWM pulses (PCA9685)
4. Update display buffer
5. Send telemetry via WiFi/BT

## Safety Features

- Joint position limits
- Servo stall detection
- Battery over-voltage/under-voltage protection
- Emergency stop via hardware kill switch

---

See [Hardware Architecture](hardware.md) for detailed hardware documentation.
See [Simulation Architecture](simulation.md) for simulation architecture.