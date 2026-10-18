'use client';

import React from 'react';

/**
 * ==============================================================================
 * ROVE & AMBER - LUXURY TYPOGRAPHY SYSTEM
 * Font Pairing:
 *   - Playfair Display (Serif): Luxury titles, hero headings, editorial accents
 *   - Inter (Sans-serif): Body copy, technical details, UI elements, eyebrows
 * ==============================================================================
 */

/**
 * Color Tokens mapped to ROVE & AMBER brand palette
 */
const COLOR_MAP = {
  default: 'text-[#1A1A1A]',
  dark: 'text-[#121212]',
  espresso: 'text-[#3A160D]',
  amber: 'text-[#B86526]',
  gold: 'text-[#C5A880]',
  polishedGold: 'text-[#D4AF37]',
  terracotta: 'text-[#8B3A1C]',
  slate: 'text-[#4A5568]',
  muted: 'text-[#5C5C5C]',
  subtle: 'text-[#7A7A7A]',
  light: 'text-[#FBF8F3]',
  white: 'text-[#FFFFFF]',
};

/**
 * HEADING COMPONENT
 * Primary editorial font: Playfair Display
 */
export function Heading({
  level = 2,
  as,
  size,
  italic = false,
  serif = true,
  color = 'default',
  align = 'left',
  tracking,
  className = '',
  children,
  ...props
}) {
  const Tag = as || (level === 'display' ? 'h1' : `h${Math.min(Math.max(level, 1), 6)}`);

  // Size hierarchy tailored for high-end perfumery
  const sizeClasses = {
    display: 'text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-normal leading-[1.08] tracking-[-0.02em]',
    1: 'text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-normal leading-[1.12] tracking-[-0.015em]',
    2: 'text-2xl sm:text-3xl md:text-4xl font-normal leading-[1.2] tracking-[-0.01em]',
    3: 'text-xl sm:text-2xl md:text-3xl font-medium leading-[1.25]',
    4: 'text-lg sm:text-xl md:text-2xl font-medium leading-[1.3]',
    5: 'text-base sm:text-lg font-medium leading-[1.35]',
    6: 'text-sm sm:text-base font-semibold leading-[1.4]',
  };

  const resolvedSize = size ? (sizeClasses[size] || size) : sizeClasses[level] || sizeClasses[2];
  const fontClass = serif ? 'font-serif font-playfair' : 'font-sans font-inter';
  const italicClass = italic ? 'italic' : '';
  const colorClass = COLOR_MAP[color] || color;
  const alignClass = align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';
  const trackingClass = tracking ? `tracking-[${tracking}]` : '';

  return (
    <Tag
      className={`${fontClass} ${resolvedSize} ${italicClass} ${colorClass} ${alignClass} ${trackingClass} ${className}`.trim()}
      {...props}
    >
      {children}
    </Tag>
  );
}

/**
 * TEXT / BODY COMPONENT
 * Primary UI and reading font: Inter (with optional Playfair for editorial quotes)
 */
export function Text({
  variant = 'body',
  as = 'p',
  serif = false,
  italic = false,
  color = 'default',
  align = 'left',
  className = '',
  children,
  ...props
}) {
  const Tag = as;

  const variantClasses = {
    lead: 'text-base sm:text-lg md:text-xl leading-[1.75] font-normal tracking-[-0.01em]',
    body: 'text-sm sm:text-base leading-[1.7] font-normal',
    small: 'text-xs sm:text-sm leading-[1.6] font-normal',
    caption: 'text-[11px] sm:text-xs leading-[1.5] tracking-wide font-medium',
    quote: 'text-lg sm:text-xl md:text-2xl leading-[1.6] font-normal italic font-serif',
  };

  const resolvedVariant = variantClasses[variant] || variantClasses.body;
  const fontClass = (serif || variant === 'quote') ? 'font-serif font-playfair' : 'font-sans font-inter';
  const italicClass = italic ? 'italic' : '';
  const colorClass = COLOR_MAP[color] || color;
  const alignClass = align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';

  return (
    <Tag
      className={`${fontClass} ${resolvedVariant} ${italicClass} ${colorClass} ${alignClass} ${className}`.trim()}
      {...props}
    >
      {children}
    </Tag>
  );
}

/**
 * EYEBROW / BADGE COMPONENT
 * Uppercase tracked micro-tagline (Inter)
 * e.g., "FINE FRAGRANCE", "THE AMBER COLLECTION", "BRAND VOICE"
 */
export function Eyebrow({
  as = 'span',
  color = 'amber',
  dot = false,
  className = '',
  children,
  ...props
}) {
  const Tag = as;
  const colorClass = COLOR_MAP[color] || color;

  return (
    <Tag
      className={`inline-flex items-center gap-2 font-sans font-inter text-[11px] sm:text-xs font-semibold uppercase tracking-[0.22em] ${colorClass} ${className}`.trim()}
      {...props}
    >
      {dot && (
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-current opacity-80" aria-hidden="true" />
      )}
      <span>{children}</span>
    </Tag>
  );
}

/**
 * SECTION HEADER COMPONENT
 * Standardized luxury page & section title block
 * Automatically combines Eyebrow + Playfair Display Title + Inter Subtitle
 */
export function SectionHeader({
  eyebrow,
  title,
  italicTitle,
  subtitle,
  align = 'center',
  accentLine = false,
  dark = false,
  level = 2,
  className = '',
  ...props
}) {
  const alignContainer =
    align === 'center'
      ? 'items-center text-center mx-auto'
      : align === 'right'
      ? 'items-end text-right ml-auto'
      : 'items-start text-left';

  return (
    <header className={`flex flex-col max-w-3xl ${alignContainer} ${className}`} {...props}>
      {eyebrow && (
        <Eyebrow color={dark ? 'gold' : 'amber'} className="mb-2.5">
          {eyebrow}
        </Eyebrow>
      )}

      {title && (
        <Heading
          level={level}
          align={align}
          color={dark ? 'light' : 'default'}
          className="mb-3"
        >
          {title}
          {italicTitle && (
            <span className="italic font-normal text-[#B86526] ml-2">
              {italicTitle}
            </span>
          )}
        </Heading>
      )}

      {accentLine && (
        <div
          className={`h-[1.5px] w-12 my-2 bg-gradient-to-r ${
            dark
              ? 'from-[#C5A880] to-transparent'
              : 'from-[#B86526] via-[#C5A880] to-transparent'
          }`}
        />
      )}

      {subtitle && (
        <Text
          variant="lead"
          align={align}
          color={dark ? 'subtle' : 'muted'}
          className="mt-1"
        >
          {subtitle}
        </Text>
      )}
    </header>
  );
}

/**
 * BRAND VOICE / LUXURY STORY CARD
 * Reusable demonstration component matching the visual brand style guide
 */
export function BrandVoiceCard({
  title = "Our Brand Voice",
  description = "Our brand voice is refined, sensory and assured. We use evocative fragrance language to suggest warmth, rarity and quiet mystery, while pairing poetic descriptions with knowledgeable details about ingredients and craft. The tone feels personal and considered, expressing luxury without losing clarity.",
  className = "",
}) {
  return (
    <div className={`p-6 sm:p-8 rounded-2xl bg-[#FBF8F3] border border-[#EBE5DC] shadow-[0_4px_24px_rgba(58,22,13,0.04)] ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <Eyebrow color="amber" dot>Brand Voice</Eyebrow>
        <span className="text-xs text-[#7A7A7A] font-inter">| Playfair Display + Inter</span>
      </div>
      
      <Heading level={3} italic color="espresso" className="mb-3 font-normal">
        {title}
      </Heading>

      <Text variant="lead" color="default" className="text-[#2A2A2A] leading-relaxed">
        {description}
      </Text>

      <div className="mt-6 pt-4 border-t border-[#EBE5DC] flex flex-wrap items-center justify-between gap-4 text-xs font-inter text-[#7A7A7A]">
        <div className="flex items-center gap-2">
          <span className="font-serif italic font-bold text-[#3A160D]">Aa</span>
          <span>Playfair Display (Serif Headings)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-sans font-semibold text-[#1A1A1A]">Aa</span>
          <span>Inter (Modern Sans Body)</span>
        </div>
      </div>
    </div>
  );
}

export default {
  Heading,
  Text,
  Eyebrow,
  SectionHeader,
  BrandVoiceCard,
};
