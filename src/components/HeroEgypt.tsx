import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

/**
 * Hero — deliberately thin.
 *   • Story column: eyebrow, one heading, one paragraph, two CTAs.
 *   • Map plate: the Egypt SVG with a small "X" marker pinned to Cairo's
 *     centroid using the same SVG viewBox so percentage math never lies.
 *   • Sharp corners. No shadows. No gradients. No doodle.
 */

const EGYPT_W = 548.58221;
const EGYPT_H = 498.86664;

// Cairo governorate centroid in the Egypt SVG's native viewBox.
// Both <Image> and the marker <svg> use preserveAspectRatio="xMidYMid meet",
// so a circle at (CX, CY) lands on the same point on the rendered map.
const CAIRO_CX = 304.272;
const CAIRO_CY = 102.454;

export default function Hero() {
  return (
    <section className="relative overflow-hidden paper-surface border-b border-line pt-20 md:pt-32 pb-16 md:pb-24">
      <div className="relative max-w-[1400px] mx-auto px-6">
        <div className="grid grid-cols-12 gap-6 md:gap-10 items-center">
          {/* Story column */}
          <div className="col-span-12 md:col-span-7">
            <span className="eyebrow text-ink-soft">AIAA Student Branch · Zewail City</span>

            <h1 className="mt-5 font-display text-[clamp(2.4rem,6vw,4.4rem)] font-semibold leading-[1.0] tracking-[-0.02em] text-ink">
              Build aerospace.<br />
              <span className="text-ember">From Egypt.</span>
            </h1>

            <p className="lead mt-6 max-w-2xl">
              We are students at Zewail City who study flight, build simulations,
              and read the kind of papers that make our professors roll their
              eyes in the good way. If aerospace ever made you curious, this
              is your crew.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/join" className="btn btn-primary">
                Apply for membership
                <span className="text-base leading-none" aria-hidden>{'->'}</span>
              </Link>
              <Link href="/about" className="btn btn-secondary">
                About the branch
              </Link>
            </div>
          </div>

          {/* Map column */}
          <div className="col-span-12 md:col-span-5">
            <div className="relative w-full max-w-[440px] md:ml-auto">
              {/* The map image, kept at its native aspect (1.10 : 1). */}
              <div className="relative w-full aspect-[548.58/498.86]">
                <Image
                  src="/egypt.svg"
                  alt="Map of Egypt with the Zewail City branch location"
                  fill
                  priority
                  sizes="(max-width: 768px) 90vw, 35vw"
                  style={{ objectFit: 'contain' }}
                />

                {/* Marker overlay. Same viewBox + same meet alignment as the
                    Image so the cross is locked to Cairo's centroid pixel-
                    perfect, regardless of container size or padding. */}
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  viewBox={`0 0 ${EGYPT_W} ${EGYPT_H}`}
                  preserveAspectRatio="xMidYMid meet"
                  aria-hidden
                >
                  {/* Crosshair over Cairo centroid. */}
                  <line
                    x1={CAIRO_CX - 14}
                    y1={CAIRO_CY}
                    x2={CAIRO_CX + 14}
                    y2={CAIRO_CY}
                    stroke="#231F20"
                    strokeWidth={2.5}
                  />
                  <line
                    x1={CAIRO_CX}
                    y1={CAIRO_CY - 14}
                    x2={CAIRO_CX}
                    y2={CAIRO_CY + 14}
                    stroke="#231F20"
                    strokeWidth={2.5}
                  />
                  <circle cx={CAIRO_CX} cy={CAIRO_CY} r={4} fill="#CC4100" />

                  {/* Caption sits a short step south-east of the cross. */}
                  <g transform={`translate(${CAIRO_CX + 18}, ${CAIRO_CY + 16})`}>
                    <text
                      fontFamily="ui-monospace, 'JetBrains Mono', monospace"
                      fontSize={14}
                      fontWeight={700}
                      letterSpacing="0.06em"
                      fill="#231F20"
                    >
                      ZEWAIL CITY
                    </text>
                    <text
                      y={18}
                      fontFamily="ui-monospace, 'JetBrains Mono', monospace"
                      fontSize={11}
                      letterSpacing="0.06em"
                      fill="#231F20"
                      fillOpacity="0.6"
                    >
                      29.95°N · 31.10°E
                    </text>
                  </g>
                </svg>
              </div>

              <p className="mt-3 eyebrow text-ink-muted">
                1 active branch · Egypt
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
