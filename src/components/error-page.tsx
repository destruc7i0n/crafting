import { isRouteErrorResponse, useRouteError } from "react-router-dom";

export const ErrorPage = () => {
  const error = useRouteError() as Error;

  return (
    <div className="flex min-h-screen items-center justify-center">
      <h1 className="text-center text-4xl font-bold">
        {isRouteErrorResponse(error)
          ? error?.statusText || error?.message
          : "Error"}
      </h1>
    </div>
  );
};
