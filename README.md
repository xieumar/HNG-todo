# Todo App

A modern, feature-rich Todo List application built with React Native (Expo) and Convex. This application provides a seamless and real-time experience for managing your tasks, with a beautiful UI, light and dark themes, and offline support.



## Features

- **Real-time CRUD Operations:** Create, read, update, and delete todos with changes reflected instantly across all devices.
- **Drag-and-Drop Sorting:** Easily reorder your todos with a smooth drag-and-drop interface.
- **Light & Dark Themes:** Switch between light and dark modes to suit your preference. The app respects your system settings by default.
- **Search & Filtering:** Quickly find todos with the built-in search functionality and filter by "All," "Active," and "Completed" statuses.
- **Offline Support:** The app detects when you're offline and provides feedback to the user.
- **User-Friendly Interface:** A clean and intuitive UI/UX for a great user experience.
- **Toast Notifications:** Get instant feedback for actions like creating, updating, or deleting todos.

## Tech Stack

- **Frontend:**
  - React Native
  - Expo
  - TypeScript
- **Backend:**
  - Convex (Real-time database)
- **Navigation:**
  - Expo Router
- **UI/UX:**
  - `react-native-draggable-flatlist` for drag-and-drop
  - `react-native-toast-message` for notifications
  - Custom-built UI components

## Getting Started

### Prerequisites

- Node.js (LTS version recommended)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/todo-app.git
    cd todo-app
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

### Backend Setup (Convex)

1.  **Create a Convex project:**
    - Sign up for a free Convex account at [convex.dev](https://www.convex.dev/).
    - Create a new project in the Convex dashboard.

2.  **Configure the Convex URL:**
    - In the `convex/` directory, run `npx convex deploy` to deploy your backend functions.
    - Get your project's URL from the Convex dashboard.
    - Open `app/_layout.tsx` and replace the `convexurl` with your Convex project URL:
      ```typescript
      const convexurl = "YOUR_CONVEX_URL";
      ```

### Running the Application

- **Start the development server:**
  ```bash
  npm start
  ```
  This will open the Expo developer tools in your browser. You can then:
  - Scan the QR code with the Expo Go app on your Android or iOS device.
  - Run on an Android emulator by pressing `a`.
  - Run on an iOS simulator by pressing `i`.

- **Run directly on a specific platform:**
  ```bash
  npm run android
  npm run ios
  npm run web
  ```

## Project Structure

```
.
├── app/              # Main application screens and navigation (using Expo Router)
├── assets/           # Static assets like fonts and images
├── components/       # Reusable UI components
├── constants/        # Theme and other constant values
├── convex/           # Convex backend functions and schema
├── hooks/            # Custom React hooks
├── scripts/          # Helper scripts
├── README.md         # This file
└── package.json      # Project dependencies and scripts
```

## Available Scripts

- `npm start`: Starts the Expo development server.
- `npm run android`: Runs the app on a connected Android device or emulator.
- `npm run ios`: Runs the app on the iOS simulator.
- `npm run web`: Runs the app in a web browser.
- `npm run lint`: Lints the project files using ESLint.
- `npm run reset-project`: Resets the project to a blank state (moves starter code to `app-example`).

## Contributing

Contributions are welcome! If you have any ideas, suggestions, or bug reports, please open an issue or submit a pull request.

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/your-feature`).
3.  Make your changes.
4.  Commit your changes (`git commit -m 'Add some feature'`).
5.  Push to the branch (`git push origin feature/your-feature`).
6.  Open a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
