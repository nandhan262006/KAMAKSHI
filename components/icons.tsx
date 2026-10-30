import type { SVGProps } from "react";

function Icon({ children, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export function IconCamera(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M3.5 8a2 2 0 0 1 2-2h1.8l1-1.5A2 2 0 0 1 10 3.7h4a2 2 0 0 1 1.7.8l1 1.5h1.8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2V8Z" />
      <circle cx="12" cy="13" r="3.4" />
    </Icon>
  );
}

export function IconFilm(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M7.5 5v14M16.5 5v14M3 9.5h4.5M3 14.5h4.5M16.5 9.5H21M16.5 14.5H21" />
    </Icon>
  );
}

export function IconBrush(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M15.5 3.5 20.5 8.5 9.5 19.5a2.4 2.4 0 0 1-3.4 0L4.5 17.9a2.4 2.4 0 0 1 0-3.4Z" />
      <path d="m13 6 5 5M4 21h4" />
    </Icon>
  );
}

export function IconUhd(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <rect x="3" y="4" width="18" height="12.5" rx="2" />
      <path d="M9 21h6M12 16.5V21" />
      <path d="M8 7v6M13.5 7h3a1.2 1.2 0 0 1 0 2.4h-3V7Zm0 2.4v3.6" />
    </Icon>
  );
}

export function IconPen(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M17 3.5a2.6 2.6 0 0 1 3.7 3.7L7.6 20.3 2.5 21.5l1.2-5.1Z" />
      <path d="m14.5 6 3.5 3.5" />
    </Icon>
  );
}

export function IconShield(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M12 3.2 19 6v5.2c0 4.8-3 8.3-7 9.8-4-1.5-7-5-7-9.8V6Z" />
      <path d="m9.2 11.8 2 2 3.6-3.8" />
    </Icon>
  );
}

export function IconBolt(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M13 2.5 4.5 13.5H11l-.5 8L19.5 10.5H13v-8Z" />
    </Icon>
  );
}

export function IconCloud(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M6.2 18.5a4.2 4.2 0 0 1-.6-8.4A6 6 0 0 1 17.3 8.7a3.7 3.7 0 0 1 1 7.3" />
      <path d="M12 20.5v-7m0 0-2.4 2.4M12 13.5l2.4 2.4" />
    </Icon>
  );
}

export function IconDrone(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <circle cx="6" cy="6" r="2" />
      <circle cx="18" cy="6" r="2" />
      <circle cx="6" cy="18" r="2" />
      <circle cx="18" cy="18" r="2" />
      <path d="M7.4 7.4 10.5 10.5M16.6 7.4 13.5 10.5M7.4 16.6 10.5 13.5M16.6 16.6 13.5 13.5" />
      <circle cx="12" cy="12" r="1.5" />
    </Icon>
  );
}

export function IconCheck(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="m4.5 12.5 5 5L20 6.5" />
    </Icon>
  );
}

export function IconArrow(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M5 12h14m0 0-6-6m6 6-6 6" />
    </Icon>
  );
}

export function IconPlay(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M8 5.5v13l11-6.5Z" />
    </Icon>
  );
}

export function IconLink(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M13.5 5.5H19v5.5M19 5.5 11 13.5" />
      <path d="M18 14v3.5a2 2 0 0 1-2 2H6.5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2H10" />
    </Icon>
  );
}
