import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup } from "@/components/ui/field";
import Image from "next/image";
import HubLogo from "@/img/hub_logo.png";
import DiscordLogo from "@/img/discord.svg";
import { toast } from "sonner";
import { useEffect } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

export default function LoginForm() {
  const query = useSearchParams();
  const errorReason = query.get("error");

  useEffect(() => {
    if (errorReason) {
      switch (errorReason) {
        case "AccessDenied":
          toast.error("Access Denied", {
            description: "You don’t have permission to access this service.",
          });
          break;
        case "AccountPending":
          toast.error("Account Pending", {
            description: "Only verified accounts can access this service.",
          });
          break;
        case "Unauthorized":
          toast.error("Unauthorized", {
            description: "You must be signed in to continue.",
          });
          break;
        case "OAuthSignin":
        case "OAuthCallbackError":
          toast.error("Authentication Failed", {
            description: "Sign-in was cancelled or failed.",
          });
          break;
        default:
          toast.error("Error", {
            description: "Something went wrong. Please try again.",
          });
          break;
      }
    }
  }, [errorReason]);
  return (
    <div className={"flex flex-col gap-6"}>
      <form>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <a
              href="#"
              className="flex flex-col items-center gap-2 font-medium"
            >
              <div className="flex size-14 items-center justify-center rounded-md">
                <Image src={HubLogo} alt="ESMS Hub logo" />
              </div>
              <span className="sr-only">ESMS Hub</span>
            </a>
            <h1 className="text-xl font-bold">ESMS Hub Toolbox</h1>
            {/* <FieldDescription>
              Don&apos;t have an account?{" "}
              <a href="https://discord.gg/PyZRxX2KZM">Sign up</a>
            </FieldDescription> */}
          </div>
          <Field className="flex items-center">
            <Button
              variant="outline"
              type="button"
              className="!w-2/3"
              onClick={() =>
                signIn("discord", { redirectTo: query.get("redirect") ?? "/" })
              }
            >
              <Image src={DiscordLogo} alt="Discord" className="dark:invert" />
              Continue with Discord
            </Button>
          </Field>
          {/* <input type="hidden" name="redirectUrl" value={redirectUrl ?? ""} /> */}
        </FieldGroup>
      </form>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our{" "}
        <a href="https://esmshub.com/privacy-policy/">Privacy Policy</a>.
      </FieldDescription>
    </div>
  );
}
