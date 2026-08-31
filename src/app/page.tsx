import { redirect } from "next/navigation";

/** The Reactor opens straight into the system. */
export default function Home() {
  redirect("/visao-geral");
}
