# Vistagram - Social Media with future location filtering

## 📌 Overview

Vistagram is a modern social feed web application where users can view, search, and filter posts by various criteria such as **all posts**, **friends**, **location**, and **popular**. It features a **minimal, responsive UI** and an improved **location-based search** that lets users type any location and filter relevant posts.

The feed is powered by a backend API and supports **JWT-based authentication**, **dynamic filtering**, and **smooth UI interactions**.

---

## ✨ Features

- **Feed Filters**
  - **All** – Shows all posts in the feed.
  - **Friends** – Shows posts from the user's friends (provided by the backend feed endpoint).
  - **Location** – Displays a modern search bar when selected, letting users type any location and filter posts accordingly.
  - **Popular** – Sorts posts by number of likes.
- **Modern Location Search**

  - Appears only when "Location" filter is selected.
  - Allows users to type **any location string** (no suggestions list).
  - Filters posts only when the search button is clicked.
  - Safe handling for unexpected or missing location data.

- **Post Display**

  - Shows user info, profile picture, verification badge, post image, caption, location, and interaction counts (likes, shares, comments).
  - Responsive design for both desktop and mobile.

- **Loading, Error & Empty States**
  - Animated loading spinner.
  - Clear error messages.
  - Helpful messages when no posts are found.

---

## 🛠 Tech Stack

### **Frontend**

- **React** – Component-based UI.
- **TypeScript** – Strong typing for maintainability.
- **Axios** – API requests.
- **Lucide Icons** – Lightweight SVG icons.
- **Tailwind CSS** – Utility-first styling for modern responsive UI.

### **Backend** (assumed from provided structure)

- **Node.js** + **Express/NestJS** – API server.
- **MongoDB + Mongoose** – Post and user data storage.
- **JWT** – Authentication.
- **Cloudinary** – Image storage (assumed from imports).
- **Multer** – File uploads (assumed from features).
- **Gemini** – for caption generartion.

---

## 🚀 Setup Instructions

### **1. Clone the repository**

```bash
git clone https://github.com/your-username/vistagram.git
cd vistagram
```

### **2. Install dependencies**

```bash
npm install
cd backend
npm install
```

### **3. Configure environment variables**

Create a `.env` file in the root with:

```
VITE_BACKEND_URL=https://your-backend-url.com or localhost:3000
```

### **4. Start the development server**

Create a `.env` file in the root of backend folder with the details in .env.example:

### **5. Start the development server**

```bash
npm run dev
```

The app will run at `http://localhost:5173` (Vite default).

---

## 🔍 Location Search Logic

### **How It Works**

1. User selects the **"Location"** filter tab.
2. A **modern search bar** appears.
3. User types in any location text.
4. On clicking the **"Search"** button:
   - Filters only posts that:
     - Have a location string.
     - Match the search query (case-insensitive).
   - Ignores posts with empty, `null`, `"unknown"`, or non-string location values.
5. Displays the filtered results or an empty state message.

### **Why This Approach?**

- **No suggestions** → keeps UX simple and avoids backend-heavy autocomplete.
- **Safe string handling** → prevents `.toLowerCase()` errors by validating `post.location` type.
- **Separation of search logic** → location search is isolated from general text search.

---

## 🧩 Code Snippet (Safe Location Filter)

```ts
case "location":
  filtered = filtered.filter(
    (post) =>
      typeof post.location === "string" &&
      post.location.trim() !== "" &&
      post.location.toLowerCase() !== "unknown"
  );

  if (locationSearchQuery.trim()) {
    const query = locationSearchQuery.toLowerCase().trim();
    filtered = filtered.filter((post) =>
      (typeof post.location === "string"
        ? post.location.toLowerCase()
        : ""
      ).includes(query)
    );
  }
  break;
```

---

## 📈 Future Improvements

- 🔍 **Debounced live search** for faster feedback without clicking search.
- 📍 **Autocomplete from existing locations** in the feed.
- 📱 **Offline-first support** with caching.
- ⚡ **Infinite scroll** for large feeds.
- 🎨 **Dark/Light mode toggle**.

---

## 🧑‍💻 Author

Built with ❤️ by Auchitya Chauhan
