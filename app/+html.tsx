import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: bodyCss }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

const bodyCss = `
body {
  /* Must match Colors.bg from constants/colors.ts */
  background-color: #0F0F0F;
  overflow: hidden;
}
#root {
  display: flex;
  flex: 1;
}
`;
