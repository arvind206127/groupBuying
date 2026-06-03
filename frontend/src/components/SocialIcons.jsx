import React from 'react';

const IconSvg = ({ size = 24, className, children, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    className={className}
    fill="currentColor"
    aria-hidden="true"
    {...props}
  >
    {children}
  </svg>
);

export const FacebookIcon = (props) => (
  <IconSvg {...props}>
    <path d="M15.12 8.24h2.18V4.37c-.38-.05-1.68-.17-3.2-.17-3.16 0-5.33 1.99-5.33 5.64v3.36H5.3v4.33h3.47V24h4.26v-6.47h3.33l.53-4.33h-3.86V10.27c0-1.25.34-2.03 2.09-2.03Z" />
  </IconSvg>
);

export const InstagramIcon = (props) => (
  <IconSvg {...props}>
    <path d="M7.1 2h9.8A5.1 5.1 0 0 1 22 7.1v9.8a5.1 5.1 0 0 1-5.1 5.1H7.1A5.1 5.1 0 0 1 2 16.9V7.1A5.1 5.1 0 0 1 7.1 2Zm0 2A3.1 3.1 0 0 0 4 7.1v9.8A3.1 3.1 0 0 0 7.1 20h9.8a3.1 3.1 0 0 0 3.1-3.1V7.1A3.1 3.1 0 0 0 16.9 4H7.1Zm4.9 3.3a4.7 4.7 0 1 1 0 9.4 4.7 4.7 0 0 1 0-9.4Zm0 2a2.7 2.7 0 1 0 0 5.4 2.7 2.7 0 0 0 0-5.4Zm5.05-2.68a1.18 1.18 0 1 1 0 2.36 1.18 1.18 0 0 1 0-2.36Z" />
  </IconSvg>
);

export const LinkedinIcon = (props) => (
  <IconSvg {...props}>
    <path d="M6.5 8.9H2.9V22h3.6V8.9ZM4.7 2A2.09 2.09 0 1 0 4.66 6.18 2.09 2.09 0 0 0 4.7 2Zm8.6 8.6V8.9H9.85V22h3.6v-6.48c0-1.71.32-3.36 2.44-3.36 2.08 0 2.11 1.95 2.11 3.47V22h3.6v-7.18c0-3.52-.76-6.23-4.87-6.23a4.27 4.27 0 0 0-3.73 2h-.05Z" />
  </IconSvg>
);
