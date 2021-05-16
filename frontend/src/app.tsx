// import "preact/debug";
import { HookRouter, useRoutes } from "hookrouter";
import type { FunctionalComponent } from "preact";
import { useErrorBoundary, useMemo } from "preact/hooks";
import { Loading } from "./components/loading";
import { Modal } from "./components/modal";
import { AuthProvider } from "./util/auth";
import { EventProvider } from "./util/events";
import { LOADING, usePromise } from "./util/use-promise";

type Route = [
  component: Promise<{ default: FunctionalComponent<any> }>,
  args?: any
];

const ROUTES: HookRouter.RouteObject<Route> = {
  "/": () => [import("./pages/home")],
  "/friends": () => [import("./pages/friends")],
  "/game/:id": (args) => [import("./pages/game"), args],
  "/login": () => [import("./pages/login")],
  "/settings": () => [import("./pages/settings")],
  "/signup": () => [import("./pages/signup")],
};

export function App() {
  const [route, args] =
    useRoutes(ROUTES) ??
    useMemo(() => [import("./pages/not-found")] as Route, []);
  const page = usePromise(route);
  const [error, resetError] = useErrorBoundary();

  return (
    <AuthProvider>
      <EventProvider>
        {error === undefined ? (
          page === LOADING ? (
            <Loading />
          ) : (
            <page.default {...args} />
          )
        ) : (
          <Modal
            confirmText="Try again"
            cancelText="Go home"
            onConfirm={() => {
              resetError();
            }}
            onCancel={() => {
              location.href = "/";
            }}
          >
            {error.toString()}
          </Modal>
        )}
      </EventProvider>
    </AuthProvider>
  );
}
