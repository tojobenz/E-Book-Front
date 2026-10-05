# EBook Frontend

A simple book management application built with **Angular 21** and connected to an **ASP.NET Core REST API**.

The app lets users browse books, search and filter them, view details, and manage their favorite books.

## 🛠️ Tech Stack

* Angular 21
* TypeScript
* SCSS
* RxJS
* Angular Router
* HttpClient
* Standalone Components

## ✨ Features

* Browse and search books
* Pagination and sorting
* Book details
* Add/remove favorites
* Loading, empty and error states
* Responsive UI
* Lazy-loaded pages
* Global HTTP error handling
* Integration with Open Library through the backend

## 📁 Project Structure

```text
src/app/
├── core/          # Services, models and interceptors
├── shared/        # Reusable components
├── features/      # Home, Books and Favorites
└── layout/        # Application layout
```

The project uses a feature-based structure to keep the application easy to maintain as it grows.

## 🚀 Getting Started

### Requirements

* Node.js 18+
* npm

### Installation

```bash
npm install
```

Configure the backend URL in:

```text
src/environments/environment.development.ts
```

Then start the application:

```bash
npm start
```

The application will be available at:

```text
http://localhost:4200
```

## 🔗 Backend

This frontend uses the **EBook ASP.NET Core API** for books, favorites and Open Library integration.

Main API resources:

```text
/api/books
/api/favorites
/api/external
```

## 🧪 Tests

```bash
npm test
```

## 🏗️ Build

```bash
npm run build
```

This project is part of my portfolio and was built to practice **Angular, TypeScript and REST API integration** with an ASP.NET Core backend.
