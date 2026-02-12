import { AuthForm } from "../../auth/_components/auth-form";
import { createAuthAction } from "../_actions/create-auth";

export function CreateAuthForm() {
  return <AuthForm action={createAuthAction} />;
}
