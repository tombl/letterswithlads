import { navigate, useTitle } from "hookrouter";
import { Modal } from "../components/modal";
import { APP_NAME } from "../config";
import Home from "./home";

export default function NotFound() {
  useTitle(`Page not found - ${APP_NAME}`);

  return (
    <>
      <Home />
      <Modal
        oneButton
        confirmText="Go home"
        onConfirm={() => {
          navigate("/");
        }}
      >
        That page wasn't found
      </Modal>
    </>
  );
}
