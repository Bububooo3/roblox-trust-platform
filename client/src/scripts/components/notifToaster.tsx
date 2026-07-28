import { CToaster } from "@coreui/react";
import { useEffect, useState, type ReactElement } from "react";
import Notify from "../functionality/notifications";

export function GlobalToaster() {
  const [displayed, setDisplayed] = useState([] as ReactElement[]);

  const [activeNotifs, setActiveNotifs] = useState(() => {
    const data = localStorage.getItem("active-notifs");
    return data ? JSON.parse(data) : [];
  });

  //

  useEffect(() => {
    const a = setInterval(() => {
      const currentData = localStorage.getItem("active-notifs");
      const parsed = currentData ? JSON.parse(currentData) : [];

      setActiveNotifs(() => {
        if (JSON.stringify(activeNotifs) === currentData) return activeNotifs;
        return parsed;
      });
    }, 500);

    return () => clearInterval(a);
  }, [activeNotifs]);

  useEffect(() => {
    setDisplayed(
      activeNotifs.map(
        ({ msg, level, id }: { msg: string; level: number; id: string }) => (
          <Notify
            key={id}
            msg={msg}
            level={level}
            onClose={() => {
              const oldData = localStorage.getItem("active-notifs");
              const arr: { msg: string; level: number; id: string }[] = oldData
                ? JSON.parse(oldData)
                : [];
              localStorage.setItem(
                "active-notifs",
                JSON.stringify(arr.filter((o) => o.id !== id)),
              );
            }}
          />
        ),
      ),
    );
  }, [activeNotifs]);

  return <CToaster placement="bottom-end">{displayed}</CToaster>;
}
