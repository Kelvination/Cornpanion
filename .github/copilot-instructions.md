# Project Outline: Real-Time React Cornhole Scoreboard PWA

## 1. Project Goal

To create a responsive, real-time web-based cornhole scoreboard Progressive Web App (PWA) built with React and Firebase Realtime Database, allowing multiple users to connect to a single game session (Host/Join) or for single-user local scoring (Solo), suitable for various use cases and eventual deployment on GitHub Pages.

## 2. Key Technologies

* **Frontend:** React
* **State Management:** React Context API or a lightweight alternative (e.g., Zustand, Jotai) for managing game state locally and syncing with Firebase.
* **Real-time Database:** Google Firebase Realtime Database
* **Styling:** CSS, SCSS, or a CSS-in-JS library (e.g., Styled Components, Emotion) for responsive design.
* **Routing:** React Router DOM
* **Deployment:** GitHub Pages (potentially using `gh-pages` package)
* **PWA Capabilities:** Web App Manifest, Service Worker (for potential offline Solo mode, installability).

## 3. Core Features & Structure

The application will be structured around different views/pages corresponding to the user flow:

### 3.1. Main Page / Entry Point

* **Layout:** Simple, mobile-first layout with clear buttons.
* **Buttons:**
    * "Host Game": Navigates to the Lobby Setup page.
    * "Join Game": Displays an input field for entering a Lobby ID/Code and a "Join" button. Navigates to the Lobby page (Joiner View) upon successful join.
    * "Solo Game": Navigates directly to the In-Game Scoreboard (Solo Mode).
* **Information:**
    * "About" Button/Link: Opens a modal or navigates to a separate page explaining:
        * How to use the app (Host/Join/Solo).
        * Explanation of rules like "Bust" (including default/configurable reset score).
        * Explanation of "Score Limit".
        * How the "Math Mode" works (calculating net score).
* **Responsiveness:** Ensure layout adapts well to different mobile screen sizes.

### 3.2. Lobby / Game Settings Page

This page has two views based on whether the user is the Host or a Joiner.

* **Shared Elements (Visible to Host and Joiners):**
    * List of connected players/users in the lobby.
    * Current game settings (Bust, Score Limit, etc.).
* **Host View (Editable Settings):**
    * **Game Code Display:** Clearly display the unique 4-character alphanumeric Lobby ID/Code.
    * **Invite Link:** A button or link that copies or navigates to a URL that allows others to join this specific lobby directly.
    * **Game Settings Section:**
        * **"Score Limit":** Number input, default 21.
        * **"Bust Rule":** Toggle switch.
            * If enabled:
                * Info icon/tooltip explaining the rule: "If a team's score *exceeds* the Score Limit after adding points, their score resets to a specified score."
                * "Bust Reset Score": Number input, default (e.g., 15, or configurable).
        * **"Allow Others to Edit Score":** Toggle switch. Info icon/tooltip: "If enabled, anyone connected to this lobby can adjust the score during the game."
        * **"Team Colors/Names":** Input fields or simple color pickers/selectors for Team 1 and Team 2 names/colors (e.g., Red vs Blue, or custom names). Defaults can be simple colors.
    * **Action Button:**
        * "Start Game": Button, always enabled for the Host. Navigates the Host and all connected users to the In-Game Scoreboard.

* **Joiner View (Read-Only Settings):**
    * Displays the Lobby ID/Code.
    * Displays all settings chosen by the Host, but inputs are disabled.
    * Message indicating "Waiting for Host to start the game...".

* **Firebase Integration:** Host's settings are stored in the Firebase Realtime Database under the specific Lobby ID. Joiners listen for changes to these settings.

### 3.3. In-Game Scoreboard Page

This is the core real-time view.

* **Layout:** Prominent display of scores, clear buttons for scoring actions, and potentially a dedicated area for "Math Mode". Designed to be highly visible and easy to use on a phone at a distance.
* **Score Display:**
    * Large, bold display of Team 1 Score and Team 2 Score.
    * Team names/colors as configured in the lobby.
* **Scoring Actions (Per Team):**
    * "+1" Button: Adds 1 point to the respective team's score.
    * "+3" Button: Adds 3 points to the respective team's score.
    * "BUST" Button: Conditionally displayed *only if* the "Bust Rule" was enabled in the lobby settings. Clicking this resets the team's score to the "Bust Reset Score".
    * "Manual Override" Button/Input: Allows entering an exact score for the team (useful for corrections). Could be a button that reveals an input field.
* **Real-Time Syncing:** Score updates triggered by any user (if "Allow Others to Edit Score" is enabled, or only the Host) are immediately reflected for all connected users via Firebase.
* **"Math Mode" / "Scoring Mode" Feature:**
    * A distinct button or toggle to activate this mode.
    * When activated, the UI shifts or a modal appears/section expands:
        * Input fields for each team:
            * Team X: Bags on Board (1 pt each) - Number input.
            * Team X: Bags in Hole (3 pts each) - Number input.
        * A "Calculate & Apply Score" button.
        * **Logic:** On clicking "Calculate & Apply Score":
            * Calculate Team 1 raw score: `(T1 Bags on Board * 1) + (T1 Bags in Hole * 3)`
            * Calculate Team 2 raw score: `(T2 Bags on Board * 1) + (T2 Bags in Hole * 3)`
            * Calculate the *net* score difference: `Net = T1 raw score - T2 raw score`.
            * If `Net > 0`: Team 1 gets `Net` points added.
            * If `Net < 0`: Team 2 gets `abs(Net)` points added.
            * If `Net == 0`: No points are added (scores cancel out).
            * *After adding points*, apply the Bust rule if enabled and the new score exceeds the limit.
            * Update the main score display and Firebase.
    * A button to exit "Math Mode".
* **Game State Indicators:**
    * "Throwing" Indicator: Visually highlight or display which team is next to throw. Whichever team scored last round is the team that throws first.
    * "Round Counter": Display the current round number. This increments each time scores are applied.
* **Game Management:**
    * "Reset Game" Button: Button to reset scores to 0-0 and round counter to 1.
    * Confirmation Modal: Clicking "Reset Game" should trigger a "Are you sure?" modal.
* **Win Condition:** Logic to detect when a team reaches or exceeds the Score Limit *and* the round is over (all bags thrown and score applied).
    * Display a prominent "TEAM X WINS!" message.
    * Provide buttons:
        * "Undo Last Score / Game Not Over": Reverts the score to the state before the winning points were added.
        * "New Game (Same Settings)": Resets scores and round counter, but keeps the current lobby and settings.
        * "Back to Lobby": Returns all connected users to the Lobby/Settings page.
* **Firebase Integration:** All score updates, round changes, and game state modifications are synced in real-time via Firebase for all connected users.

### 3.4. Solo Mode

* Operates identically to the In-Game Scoreboard page, but without any Firebase connection.
* Game state is stored and managed purely in the browser's local state.
* Settings (Bust, Score Limit, Team Names) need to be configurable within the Solo mode interface, maybe in a settings modal or at the start.

### 4. Technical Considerations

* **Unique Lobby ID Generation:** Implement a method to generate short, unique, and easy-to-share 4-character alphanumeric IDs. Check for collisions when creating a new lobby.
* **State Management:** Decide on a strategy for managing game state (scores, settings, connected users, current round, etc.) across components and syncing with Firebase.Jotai is a good choice.
* **Real-time Database Structure:** Design the Firebase data structure efficiently to store lobby settings, game state, and connected users under each unique Lobby ID.
* **Responsiveness:** Use CSS media queries, Flexbox, or Grid to ensure the layout adapts correctly to portrait and landscape orientations on various mobile devices. Consider touch target sizes for buttons.
* **PWA Implementation:** Add a `manifest.json` file and configure a service worker to enable "Add to Home Screen" and potentially cache assets for offline use (especially relevant for Solo mode).
* **Error Handling:** Handle cases like invalid Lobby IDs when joining, Firebase connection issues, etc.

### 5. Use Cases

The design supports the stated use cases:

1.  **Solo Offline:** The "Solo Game" mode fulfills this. It operates locally without Firebase.
2.  **Host Scorekeeper, Remote Viewers:** Host creates the lobby, others join. Host keeps score using the buttons/Math Mode. Joiners see the score update in real-time but do not interact with score controls (unless the host enabled editing).
3.  **Collaborative Scoring:** Host creates the lobby and enables the "Allow Others to Edit Score" setting. All connected users can use the score controls (+1, +3, Bust, Manual Override, Math Mode) to update the score.
4.  **Sideline Scorekeeper:** Similar to Use Case 2, but the Host is a dedicated person off-board. They create the lobby, share the code/link, and keep score remotely.


### 6. Firebase Setup
```
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBXUP9HjObwMOHGzQbcoSANVd7ye3JR2Kw",
  authDomain: "cornpanion.firebaseapp.com",
  databaseURL: "https://cornpanion-default-rtdb.firebaseio.com",
  projectId: "cornpanion",
  storageBucket: "cornpanion.firebasestorage.app",
  messagingSenderId: "189897565377",
  appId: "1:189897565377:web:f1e0f15f9dac5a22b36040",
  measurementId: "G-LYHCVGN1VC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
```

Here are the Security rules:
```
{
  "rules": {
    // The 'lobbies' node will hold all game lobbies
    "lobbies": {
      // Use a wildcard $lobbyId to match any lobby key (your 4-char code)
      "$lobbyId": {
        // Anyone can read the data for any lobby
        ".read": true,

        // Write access is conditional
        ".write": "data.parent().child('settings/allowOthersToEditScore').val() === true"
        // This rule means:
        // A user can write to *any* path within a specific $lobbyId
        // IF the value of the 'allowOthersToEditScore' node under the 'settings' node
        // within that same lobby is explicitly set to 'true'.
        // This covers score updates, round changes, math mode results, etc.

        // If you wanted to restrict writes ONLY to the host, you'd need authentication
        // and store the host's UID in the lobby data, then the rule would be:
        // ".write": "auth != null && data.parent().child('settings/hostUid').val() === auth.uid"
        // But based on your current outline, the first write rule aligns with the 'Allow Others to Edit Score' toggle.
      }
    },
    // Prevent any reads or writes to the root of the database
    // or any path not under the 'lobbies' node.
    ".read": false,
    ".write": false
  }
}
```