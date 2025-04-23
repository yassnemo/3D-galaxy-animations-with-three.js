## 3D Galaxy Navigation with Three.js

This project showcases an immersive 3D galaxy experience built with Three.js. Users can navigate through a beautiful cosmic environment filled with spiral galaxies and stars, creating an engaging and interactive web-based experience.

## Demo

![image](https://github.com/user-attachments/assets/fd45e9fa-d0a5-4400-8160-b1495a2efffd)



## Project Structure

- **src/**: Contains the source code for the application.
  - **index.js**: Entry point of the application that initializes the Three.js scene.
  - **animation.js**: Core implementation of galaxy generation and navigation controls.
  - **utils/**: Contains helper functions for the 3D environment.
  
- **public/**: Contains public assets.
  - **index.html**: Main HTML file that loads the 3D galaxy experience.
  - **styles.css**: Styling for the UI elements and navigation instructions.

- **assets/**: Contains assets used in the project.
  - **fonts/**: Directory for font data used in UI elements.

## Controls

- **Movement**: W, A, S, D keys or Arrow keys
- **Look Around**: Click and drag the mouse
- **Speed Boost**: Hold Shift while moving
- **Create Galaxy**: Press Spacebar to create a new galaxy at your current location

## Technical Implementation

The project utilizes several Three.js features:

- **Point Geometry** for generating galaxy particles with custom attributes
- **Custom Camera Controls** for first-person navigation
- **Particle Systems** for creating stars and galaxy arms
- **Dynamic Lighting** to enhance visual appearance
- **Color Interpolation** for visually appealing galaxy gradients
- **Mouse & Touch Interaction** for cross-platform compatibility

## Setup Instructions

1. **Clone the repository**:
   ```
   git clone https://github.com/yassnemo/galaxy-animations-with-three.js.git
   cd galaxy-animation-with-threejs
   ```

2. **Install dependencies**:
   ```
   npm install
   ```

3. **Run the project**:
   ```
   npm start
   ```

4. **Open your browser** and navigate to `http://localhost:8081` (or the port specified by your webpack configuration) to experience the 3D galaxy navigation.


## Acknowledgements

- Three.js team for the amazing 3D library
- Inspiration from various space visualization projects
