import "../globals.css";
const inter = Inter({ subsets: ["latin"] });
import { Inter } from "next/font/google";
export const metadata = {
  title: "Login",
  description: "HiveMind Login Page",
};
export default function LoginLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}