import { RouterProvider, createBrowserRouter } from "react-router-dom";

import { ErrorPage } from "./components/error-page";
import { Index } from "./routes";
import { Root } from "./routes/root";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <Index />,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
