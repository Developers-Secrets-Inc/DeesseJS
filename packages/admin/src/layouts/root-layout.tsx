import { LoginPage } from "../pages/login-page";

export const RootLayout: React.FC<{ segments: string[] }> = ({
  segments,
}: {
  segments: string[];
}) => {
  if (segments.includes("login")) {
    return <LoginPage />;
  }
  
  return (
    <div>
      <h1>Root Layout</h1>
      <ul>
        {segments.map((segment, index) => (
          <li key={index}>{segment}</li>
        ))}
      </ul>
    </div>
  );
};
