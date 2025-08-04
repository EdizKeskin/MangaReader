"use client";

export function GTMNoScript() {
  return (
    <div
      dangerouslySetInnerHTML={{
        __html: `
          <noscript>
            <iframe src="https://www.googletagmanager.com/ns.html?id=${process.env.NEXT_PUBLIC_GTM_ID}"
              height="0" width="0" style="display:none;visibility:hidden"></iframe>
          </noscript>
        `,
      }}
    />
  );
}
