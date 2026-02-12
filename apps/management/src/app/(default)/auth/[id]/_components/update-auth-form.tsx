import { createClient } from "@/lib/api";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { updateAuthAction } from "./_actions/update-auth";
import { AuthForm } from "../../_components/auth-form";

type Props = {
  id: string;
};

export async function UpdateAuthForm({ id }: Props) {
  const client = createClient();
  const result = await client.admin.auth[":authId"].$get(
    {
      param: { authId: id },
    },
    {
      headers: {
        cookie: cookies().toString(),
      },
    },
  );

  if (!result.ok) {
    if (result.status === 404) {
      notFound();
    }
    throw new Error("Failed to fetch project");
  }

  const { auth } = await result.json();
  const action = updateAuthAction.bind(null);

  return <AuthForm defaultValue={auth} isDisableIdField action={action} />;
}
