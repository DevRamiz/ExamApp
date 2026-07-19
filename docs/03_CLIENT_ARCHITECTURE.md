# Client Architecture

## Technology and packages

The client is located in `client/`.

| Package | Purpose |
|---|---|
| `react` | Components, state, hooks, and rendering |
| `react-dom` | Mounts the React application in the browser |
| `react-router-dom` | Client-side routes and navigation |
| `vite` | Development server and production build |
| `@vitejs/plugin-react` | React support for Vite |

No Redux, component framework, or chart library is required. This keeps the client small and readable.

## Folder structure

```text
client/src/
├── main.jsx                 Application entry point
├── App.jsx                  Route map
├── api/http.js              Shared REST helper
├── context/AuthContext.jsx  Global user/session state
├── hooks/                   WebSocket notification lifecycle
├── components/              Shared layout and presentation
├── pages/admin/             Administrator pages
├── pages/teacher/           Lecturer pages
├── pages/student/           Student pages
└── styles.css               Global responsive styles
```

## Component hierarchy

```text
main.jsx
└── BrowserRouter
    └── AuthProvider
        └── App
            ├── LoginPage
            ├── RegisterPage
            └── ProtectedRoute
                └── Layout
                    ├── Navigation / mobile menu
                    ├── NotificationCenter
                    ├── Admin pages
                    ├── Lecturer pages
                    └── Student pages
```

## Routing

`App.jsx` defines all routes. `ProtectedRoute` performs two interface checks:

1. A user must be logged in.
2. The user role must match the requested page.

These checks improve the interface, but the server repeats authorization because browser code cannot be trusted as security.

## State management

### Authentication state

`AuthContext` stores:

- the current user;
- the JWT;
- loading state;
- login, registration, and logout functions.

### Page state

Each page owns the state related to its form or displayed data. Examples:

- `ExamEditorPage` owns exam title, settings, and question objects.
- `TakeExamPage` owns current answers, save state, and submission state.
- Analytics pages own the result of analytics API requests.

This project does not need a large global store because most data belongs to one page.

## API communication

`client/src/api/http.js` is the network gateway. It:

- builds the request URL;
- adds `Content-Type` where needed;
- adds the JWT authorization header;
- parses JSON errors consistently;
- returns the response data to the page.

Pages therefore do not repeat low-level fetch logic.

## Auto-save flow

`TakeExamPage` keeps answers in React state and also keeps the latest answers in a ref. Every ten seconds it sends a `PATCH` request to the auto-save endpoint. The ref prevents the interval callback from using an old state snapshot.

The server validates ownership and attempt status before updating `answers JSONB`.

## WebSocket flow

`useRealtimeNotifications` opens the authenticated WebSocket, receives live events, and reconnects after a disconnected connection. `Layout` displays temporary messages and the persistent `NotificationCenter` loads history from the REST API.

During an active exam, the student page also sends monitoring heartbeats. The lecturer monitoring page combines REST snapshots with incoming WebSocket updates.

## Responsive design

`styles.css` contains shared layout rules and mobile breakpoints. On small screens:

- navigation changes to a mobile drawer;
- grids become one column;
- actions wrap vertically;
- tables are placed in scrollable containers;
- exam and grading controls remain usable with touch input.
