import type { ComponentChildren } from "preact";
import { useState } from "preact/hooks";
import { Button } from "./button";
import { Loading } from "./loading";

export function LoadingButton({
  children,
  onClick,
  ...props
}: {
  children: ComponentChildren;
  onClick(): Promise<void>;
} & Parameters<typeof Button>[0]) {
  const [isLoading, setLoading] = useState(false);

  return (
    <Button
      onClick={async () => {
        setLoading(true);
        try {
          await onClick();
        } finally {
          setLoading(false);
        }
      }}
      {...props}
    >
      {isLoading ? <Loading>{children}</Loading> : children}
    </Button>
  );
}
