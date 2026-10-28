# Femilia — Highly Expressive 3D-Printed Robot

Femilia is an open-source, highly expressive humanoid robot featuring a 3D-printed body, audio commands, visual capturing capabilities, a micro LED screen for expressions, servo-based movement, and dual-mode connectivity (Bluetooth & WiFi). The project emphasizes modularity, with clear separation between hardware design, firmware, simulation, and software control systems.

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)]
[![License](https://img.shields.io/badge/license-MIT-blue)]
[![Discord](https://img.shields.io/badge/chat-on_Discord-5865F2)]

---

## Table of Contents

1. [Overview](#overview)
2. [Hardware Components & Specifications](#hardware-components--specifications)
3. [Circuit Diagrams, Connections & Architecture](#circuit-diagrams-connections--architecture)
4. [Simulation Setup](#simulation-setup)
5. [Physical Implementation & Component Functionality](#physical-implementation--component-functionality)
6. [Simulation Limitations & Hardware Implementation Plan](#simulation-limitations--hardware-implementation-plan)
7. [Quick Start Guide](#quick-start-guide)
8. [Contributing](#contributing)
9. [License](#license)

---

## Overview

Femilia is designed as a versatile robotics platform with the following key features:

- **Audio Commands**: Voice recognition and speech synthesis via I2S audio codec
- **Visual Capturing**: High-resolution camera module for computer vision applications
- **Micro LED Screen**: 1.3" OLED display (128x64) for expressive facial animations
- **Servo Control**: 12+ servos for articulated movement (head, arms, torso)
- **Connectivity**: ESP32 WiFi + HC-05 Bluetooth dual-mode communication
- **Power Management**: Dual-board setup (Power Distribution Board + Main Controller) with integrated power monitoring

---

## Hardware Components & Specifications

### Bill of Materials (BOM)

| Component | Part Number | Quantity | Specifications | Source |
|-----------|-------------|----------|----------------|--------|
| **Main Controller Board** | ESP32-WROOM-32D | 1 | Dual-core, 240MHz, 520KB RAM, WiFi/BT | Mouser #678-ESPWROOM32D |
| **Power Management Board** | Custom PDB | 1 | 5V/3.3V regulators, current sensing | PCB Fabrication |
| ** servos** | MG996R | 8 | Torque: 11kg/cm, Digital, Metal Gear | HobbyKing #2214 |
| **Micro Servo** | SG90 | 4 | Torque: 1.8kg/cm, Plastic Gear | eBay |
| **Micro LED Display** | SSD1306 OLED 1.3" | 1 | 128x64 pixels, I2C interface | Adafruit #938 |
| **Camera Module** | OV5640 | 1 | 5MP, 1080p30, JPEG output | ArduCAM |
| **Audio Codec** | WM8960 | 1 | I2S, 24-bit, 96kHz, 3.5mm jack | Mouser #583-WM8960 |
| **Microphone** | INMP441 | 1 | Digital MEMS, I2S | Digi-Key #INMP441 |
| **Speaker** | 8Ω 3W | 1 | 25mm diameter | Generic |
| **LiPo Battery** | 11.1V 3S 5000mAh | 1 | 30C discharge, JST-XH connector | Turnigy |
| **Power Switch** | Toggle SPST | 1 | 5A rating | Generic |
| **Voltage Regulators** | LM2596 (5V) | 2 | 3A buck converter | Generic |
| **Voltage Regulators** | AMS1117-3.3 | 2 | 1.5A LDO | Generic |
| **Level Shifters** | TXS0108E | 1 | 8-channel bidirectional | TI |

### Assembly BOM (3D Printed Parts)

| Part | Material | Infill | Layer Height |
|------|----------|--------|--------------|
| Head Shell | PLA | 20% | 0.2mm |
| Torso | PETG | 30% | 0.2mm |
| Arm Links | PLA | 15% | 0.2mm |
| Servo Mounts | PETG | 40% | 0.15mm |
| Display Housing | PLA | 25% | 0.15mm |
| PCB Mounts | PETG | 50% | 0.2mm |

---

## Circuit Diagrams, Connections & Architecture

### System Architecture

Femilia employs a **dual-board architecture** for optimal separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                    POWER DISTRIBUTION BOARD                │
│                                                              │
│  [LiPo 11.1V] → [Switch] → [DC-DC 5V] → [DC-DC 3.3V]      │
│        │                                                      │
│        └────→ [Current Sensor INA219] → ESP32 ADC            │
│        │                                                      │
│        └────→ [Battery Monitor] (Voltage/Current)            │
└─────────────────────────────────────────────────────────────┘
                              │ I2C/SPI/UART/Signals
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   MAIN CONTROLLER BOARD                    │
│                                                              │
│  [ESP32-WROOM-32D] ← Central Processing Unit               │
│        │                                                      │
│        ├── [I2C] → OLED Display (0x3C)                       │
│        ├── [I2C] → IMU MPU-6050                               │
│        ├── [I2S] → WM8960 Audio Codec → Speaker              │
│        ├── [I2S] → INMP441 Microphone                         │
│        ├── [SPI] → OV5640 Camera                              │
│        ├── [UART] → HC-05 Bluetooth (soft UART)              │
│        └── [PWM] → PCA9685 Servo Controller (I2C)            │
│                                                              │
│  [PCA9685 @ 0x40] → 16-channel PWM driver                   │
│        │                                                      │
│        ├── PWM[0-7] → MG996R Servos (Arms, Torso)           │
│        └── PWM[8-15] → SG90 Servos (Head, Hands)            │
└─────────────────────────────────────────────────────────────┘
```

### Pinout Connections

**ESP32 Main Board Pin Assignments:**

| Pin | Function | Connected Device | Notes |
|-----|----------|------------------|-------|
| GPIO 21 | SDA | OLED Display | I2C0 |
| GPIO 22 | SCL | OLED Display | I2C0 |
| GPIO 25 | I2S_CLK | WM8960 | Audio output |
| GPIO 26 | I2S_WS | WM8960 | Audio LRCK |
| GPIO 27 | I2S_DOUT | WM8960 | Audio data |
| GPIO 12 | I2S_MCLK | WM8960 | Master clock |
| GPIO 0 | I2S_DIN | INMP441 | Mic input |
| GPIO 18 | SPI_SCK | OV5640 | Camera clock |
| GPIO 19 | SPI_MOSI | OV5640 | Camera data |
| GPIO 23 | SPI_MISO | OV5640 | Camera data |
| GPIO 5 | CS | OV5640 | Camera CS |
| GPIO 4 | PWM | HC-05 | BT LED |
| GPIO 32 | ADC1_CH4 | INA219 | Current sense |
| GPIO 33 | ADC1_CH5 | Battery | Battery voltage |

### Wiring Schematics Location

- **Schematic PDFs**: `hardware/schematics/`
- **PCB Layout Files**: `hardware/pcb/`
- **Fritzing Diagrams**: `hardware/schematics/fritzing/`
- **Netlist Files**: `firmware/config/netlists/`

---

## Simulation Setup

Femilia uses **Gazebo + ROS 2 Foxy** for physics-based simulation before hardware deployment.

### Prerequisites

```bash
# Ubuntu 22.04 LTS (Recommended)
# ROS 2 Foxy Installation
sudo apt update && sudo apt install ros-foxy-desktop-gazebo
```

### Installation

```bash
# Clone the repository
git clone https://github.com/OORCA/femilia.git
cd femilia

# Build simulation workspace
cd simulation
rosdep install --from-paths src --ignore-src -r -y
colcon build --symlink-install
```

### Running the Simulation

```bash
# Launch the FEMILIA robot in Gazebo
ros2 launch femilia_simulation femilia_gazebo.launch.py

# Launch with RViz visualization
ros2 launch femilia_simulation femilia_rviz.launch.py

# Run kinematic tests
ros2 launch femilia_simulation kinematics_test.launch.py world:=simple_world
```

### Available Simulation Worlds

Located in `simulation/worlds/`:

| World | Description | Use Case |
|-------|-------------|----------|
| `empty_world` | Flat ground plane | Basic kinematic testing |
| `simple_world` | Obstacles + floor | Navigation validation |
| `expression_world` | Interactive objects | Expression-to-movement mapping |
| `power_world` | Load simulation | Power consumption modeling |

### Commands Interface

```bash
# Send voice command simulation
ros2 service call /femilia/speech_service femilia_interfaces/srv/Say ["/text: Hello world"])

# Get robot state
ros2 topic echo /femilia/joint_states

# Set LED expression
ros2 service call /femilia/expression_service femilia_interfaces/srv/SetExpression ["/expression: happy"])
```

---

## Physical Implementation & Component Functionality

### Component Roles & Integration

#### Micro LED Display (Facial Expressions)

The 1.3" SSD1306 OLED display is mounted at the front of the head housing, positioned to serve as Femilia's "face". The display receives serialized frame data via I2C from the ESP32. The **expression engine** (`software/expression_engine.py`) converts emotional states into frame buffers:

- **Happy**: Smiling "U" shape with raised eyebrows
- **Sad**: Frowning "U" shape with downturned eyes
- **Surprise**: Wide open eyes with curved eyebrows
- **Anger**: Furrowed brows with narrow eyes
- **Neutral**: Straight mouth with relaxed eyes

```python
# Example expression frame generation
def generate_happy_face():
    frame = np.zeros((64, 128), dtype=np.uint8)
    cv2.line(frame, (20, 35), (108, 35), 255, 2)  # Smile
    cv2.circle(frame, (35, 15), 3, 255, -1)      # Left eyebrow
    cv2.circle(frame, (93, 15), 3, 255, -1)      # Right eyebrow
    return frame
```

#### Visual Capturing System

The OV5640 camera is mounted in a retractable housing on the torso. It streams at 1080p30 via SPI to the ESP32's camera interface. Computer vision pipelines in `software/vision/` process frames for:

- **Object Detection**: YOLOv8 nano model for person/thing recognition
- **Face Tracking**: MTCNN for facial landmark extraction
- **Gesture Recognition**: MediaPipe Hands for hand gesture detection

Processed data is transmitted via WiFi to remote analysis servers.

#### Audio Subsystem

The WM8960 audio codec handles bidirectional audio:

- **Input**: INMP441 microphone → I2S → WM8960 → ESP32
- **Output**: ESP32 I2S → WM8960 → 3W speaker

Voice commands are processed through:

1. **Wake Word Detection**: TinyML model (Porcupine) on-device
2. **Speech-to-Text**: Remote API (Whisper) via WiFi
3. **Command Parsing**: Local NLP in `software/audio/command_parser.py`

#### Servo Control Architecture

Servos are controlled via a PCA9685 16-channel PWM driver on I2C. The **inverse kinematics solver** (`firmware/src/ik_solver.c`) computes target angles for given end-effector positions. Joint limits and safety ranges are defined in `hardware/config/joint_limits.yaml`.

**Servo Mapping:**

| Servo | Joint | Range | Torque |
|-------|-------|-------|--------|
| S1 | Head Yaw | -45° to +45° | SG90 |
| S2 | Head Pitch | -30° to +30° | SG90 |
| S3 | Left Shoulder Roll | 0° to 90° | MG996R |
| S4 | Left Shoulder Pitch | -30° to 60° | MG996R |
| S5 | Left Elbow | 0° to 120° | MG996R |
| S6 | Right Shoulder Roll | 0° to 90° | MG996R |
| S7 | Right Shoulder Pitch | -30° to 60° | MG996R |
| S8 | Right Elbow | 0° to 120° | MG996R |
| S9 | Torso Twist | -30° to +30° | SG90 |
| S10-S12 | Hand Grippers | 0° to 45° | SG90 |
| S13 | Left Hip Roll | -10° to +10° | SG90 |
| S14 | Right Hip Roll | -10° to +10° | SG90 |

### 3D Printing & Assembly Guide

Complete build documentation is available in `hardware/assembly/`:

1. **`assembly/manual.pdf`**: Step-by-step assembly manual
2. **`assembly/print_settings.yaml`**: Printer configurations
3. **`hardware/cad/`**: Fusion 360 source files (FEMILIA_Robot_v1.2.f3d)
4. **`hardware/pcb/`**: Gerber files for PCB fabrication

**Assembly Sequence:**

1. Print all parts using recommended settings
2. Install servos in torso mounts (verify timing belts)
3. Mount PCB boards using M3x8 screws
4. Connect wiring harness (follow wire colors)
5. Flash firmware to ESP32
6. Calibrate joint zero positions
7. Test expression display
8. Verify power consumption at idle

---

## Simulation Limitations & Hardware Implementation Plan

### Physical Simulation Limitations

The Gazebo simulation provides a realistic but **idealized** model. Key limitations include:

| Limitation | Simulation Model | Real-World Impact |
|------------|------------------|-------------------|
| **Friction** | Coulomb friction model | Actual servo stalling under load |
| **Servo Torque** | Impulse-based | Real MG996R may stall at >10kg load |
| **Power Draw** | Constant current | Real batteries sag under peak load |
| **Gear Backlash** | Rigid joints | Causes positioning inaccuracy |
| **Acoustic Delay** | Instant playback | Real speakers have 50ms latency |
| **Camera Latency** | Zero frame delay | Real OV5640 has 100ms readout time |

### Hardware Implementation Roadmap

#### Phase 0: Minimal Viable Robot
- [ ] Single-board (ESP32) prototype
- [ ] 2 servos (head yaw/pitch)
- [ ] Basic expression display
- [ ] Serial console control
- Status: **In Progress** | Target: 2024-01-15

#### Phase 1: Mobility Platform
- [ ] Dual-board architecture implemented
- [ ] 6 servos (arms + torso)
- [ ] WiFi dashboard control
- [ ] Battery power monitoring
- Status: **Planning** | Target: 2024-03-01

#### Phase 2: Perception Stack
- [ ] Camera integration
- [ ] Object detection (YOLO)
- [ ] Voice command processing
- [ ] Bluetooth remote control
- Status: **Blocked** | Target: 2024-05-15

#### Phase 3: Full Expressive System
- [ ] Complete servo array
- [ ] Audio output (speaker)
- [ ] Full expression library
- [ ] Power management optimization
- Status: **Not Started** | Target: 2024-08-01

### Power Management Challenges

#### Dual-Board vs Integrated Architecture

| Aspect | Dual-Board | Integrated (Recommended) |
|--------|------------|--------------------------|
| **Isolation** | Complete power domains | Shared 3.3V rail |
| **Efficiency** | 85% (two conversions) | 92% (single conversion) |
| **Debugging** | Easier fault isolation | Requires multimeter |
| **Assembly** | 2 PCBs, 4 connectors | 1 PCB, simpler |
| **Cost** | $12 (2 boards) | $8 (single board) |

**Recommendation**: Use integrated design for production, maintain dual-board for development/debugging.

#### Power Budget Analysis

| Subsystem | Current @ 5V | Current @ 3.3V | Notes |
|-----------|----------------|----------------|-------|
| ESP32 (active) | 180mA | - | WiFi connected |
| OLED Display | 15mA | - | Max brightness |
| 8× MG996R | 2500mA | - | All servos moving |
| 4× SG90 | 400mA | - | Holding position |
| Camera | 250mA | - | OV5640 module |
| Audio Amp | 300mA | 150mA | 3W speaker |
| **Total Peak** | **3.6A** | **150mA** | Short bursts |
| **Idle** | **200mA** | **50mA** | All static |

#### Recommended Power Solution

```
LiPo 3S 5000mAh 30C
    │
    ├─> BMS 3S (Protection)
    │       │
    │       ├─> Step-down DC-DC 5V 5A (Servos)
    │       │
    │       └─> Step-down DC-DC 5V 3A (Logic)
    │               │
    │               └─> LDO 3.3V 1A (Critical circuits)
```

**Run Time Estimation**:
- Idle: 5000mAh / 250mA = **20 hours**
- Normal Use: 5000mAh / 800mA = **6.25 hours**
- Active (peak): 5000mAh / 3600mA = **1.4 hours**

---

## Quick Start Guide

### For Developers

```bash
# Clone repository
git clone https://github.com/OORCA/femilia.git
cd femilia

# Install dependencies
pip install -r requirements.txt

# Build firmware (requires ESP-IDF)
./scripts/build/firmware_build.sh

# Start simulation
ros2 launch femilia_simulation femilia_gazebo.launch.py

# Flash to hardware (connect via USB)
./scripts/flash/flash_hardware.sh
```

### For Makers (Physical Build)

```bash
# Download STL files
# Print all 3D parts
# Order components from BOM
# Follow assembly manual in hardware/assembly/
# Flash pre-compiled firmware from releases/
```

---

## Contributing

We welcome contributions! Please see our [Contributing Guide](docs/guides/CONTRIBUTING.md) for details.

### Pull Request Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Setup

```bash
# Fork and clone
git clone https://github.com/YOUR_USERNAME/femilia.git
cd femilia

# Install pre-commit hooks
pre-commit install

# Run tests
pytest software/tests/
make -C firmware test
```

---

## License

Distributed under the MIT License. See `LICENSE` for more information.

---

**Built with ❤️ by the OORCA Robotics Team**